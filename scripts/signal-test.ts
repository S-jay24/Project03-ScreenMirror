/**
 * GravityStream — AirPlay Engine Manager (v13)
 *
 * Fixes from v12:
 * 1. FLICKERING: Frame server caches the last valid frame in memory.
 *    Only updates when the new file is a complete valid JPEG (starts with 0xFFD8).
 *    This prevents serving partial writes.
 *
 * 2. AUTO-DISCONNECT: More conservative disconnect detection.
 *    Only triggers on "video_renderer_stop" (explicit stop).
 *    Ignores transient TEARDOWN messages that happen during rotation.
 *
 * 3. FULL LOGGING: All UxPlay output logged to /tmp/gs-uxplay.log for debugging.
 */

import { spawn, ChildProcess } from 'node:child_process'
import { WebSocketServer } from 'ws'
import http from 'node:http'
import fs from 'node:fs'

const UXPLAY_PATH = '/tmp/uxplay/build/uxplay'
const DEVICE_NAME = 'GravityStream-TV'
const WS_PORT = 7200
const FRAME_PORT = 7300
const FRAME_PATH = '/tmp/gs-frame.jpg'
const LOG_PATH = '/tmp/gs-uxplay.log'

let currentState: 'waiting' | 'connected' | 'mirroring' = 'waiting'
let uxplay: ChildProcess | null = null
let startupTime = 0

// ─── In-memory frame cache (prevents serving partial writes) ──────────────────
let cachedFrame: Buffer | null = null
let frameWatcher: ReturnType<typeof setInterval> | null = null

function startFrameWatcher() {
  if (frameWatcher) return
  log(`Frame watcher started`)
  frameWatcher = setInterval(() => {
    try {
      if (!fs.existsSync(FRAME_PATH)) return
      const data = fs.readFileSync(FRAME_PATH)
      
      // Validate: JPEG must start with 0xFFD8 and end with 0xFFD9
      if (data.length < 500) {
        // log(`Frame REJECTED: Too small (${data.length} bytes)`)
        return
      }
      
      const startsWithMarker = data[0] === 0xFF && data[1] === 0xD8
      const endsWithMarker = data[data.length - 2] === 0xFF && data[data.length - 1] === 0xD9
      
      if (startsWithMarker && endsWithMarker) {
        cachedFrame = data
      } else {
        log(`Frame REJECTED: Invalid markers. Start: ${startsWithMarker}, End: ${endsWithMarker}, Size: ${data.length}`)
      }
    } catch (e: any) {
      log(`Frame watcher error: ${e.message}`)
    }
  }, 30) // Check ~33fps
}

function stopFrameWatcher() {
  if (frameWatcher) { clearInterval(frameWatcher); frameWatcher = null }
  cachedFrame = null
}

// ─── Log file ─────────────────────────────────────────────────────────────────
const logStream = fs.createWriteStream(LOG_PATH, { flags: 'w' })
function log(msg: string) {
  const ts = new Date().toISOString().substring(11, 23)
  const line = `[${ts}] ${msg}`
  console.log(line)
  logStream.write(line + '\n')
}

// ─── WebSocket ────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT })

function broadcast(state: string, deviceName?: string) {
  const prev = currentState
  currentState = state as any
  const msg = JSON.stringify({ event: 'connection', state, deviceName: deviceName ?? null })
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg) })
  log(`STATE: ${prev} → ${state}${deviceName ? ' (' + deviceName + ')' : ''}`)
}

wss.on('connection', (ws) => {
  log(`Dashboard WS connected`)
  ws.send(JSON.stringify({ event: 'connection', state: currentState, deviceName: currentState !== 'waiting' ? 'iPhone' : null }))
})

// ─── Frame Server — serves cached valid frame ─────────────────────────────────
const frameServer = http.createServer((req, res) => {
  if (req.url?.startsWith('/frame')) {
    if (cachedFrame) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': String(cachedFrame.length),
      })
      // log(`Served frame: ${cachedFrame.length} bytes`); // Too spammy for console, but useful for debugging
      return res.end(cachedFrame)
    }
    res.writeHead(204); return res.end()
  }
  res.writeHead(404); res.end()
})
frameServer.listen(FRAME_PORT, () => log(`Frame server → http://localhost:${FRAME_PORT}/frame`))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function clearFrame() { try { fs.unlinkSync(FRAME_PATH) } catch {} }

// ─── Spawn UxPlay ─────────────────────────────────────────────────────────────
function startUxPlay() {
  if (uxplay) { uxplay.removeAllListeners(); uxplay.kill() }
  stopFrameWatcher()
  clearFrame()
  broadcast('waiting')
  startupTime = Date.now()

  uxplay = spawn(UXPLAY_PATH, [
    '-n', DEVICE_NAME,
    '-nh',
    '-fps', '30',
    '-vs', `jpegenc quality=70 ! multifilesink location=${FRAME_PATH} max-files=1`,
    '-reset', '0',     // Never auto-reset (we handle it ourselves)
    '-nofreeze',       // Don't keep frozen frame after disconnect
    '-d',
  ], { stdio: ['pipe', 'pipe', 'pipe'] })

  log(`UxPlay PID ${uxplay.pid} — jpegenc pipeline, reset=0`)

  const handleOutput = (data: Buffer) => {
    const text = data.toString()
    const elapsed = Date.now() - startupTime
    if (elapsed < 3000) return // skip init noise

    for (const line of text.split('\n')) {
      const t = line.trim()
      if (!t) continue

      // Log non-spammy lines
      const isPacket = t.includes('raop_rtp audio') || t.includes('raop_rtp video')
      if (!isPacket) {
        log(`[UXPLAY] ${t}`)
      }

      // ── CONNECT: AirPlay SETUP request
      if (t.includes('Handling request') && t.includes('SETUP')) {
        if (currentState === 'waiting') {
          log(`CONNECTION EVENT: SETUP detected`)
          broadcast('connected', 'iPhone')
        }
      }

      // ── MIRRORING: first video packet = stream is live
      if (t.includes('raop_rtp video')) {
        if (currentState === 'connected' || currentState === 'waiting') {
          log(`MIRRORING EVENT: First video packet detected`)
          broadcast('mirroring', 'iPhone')
          startFrameWatcher()
        }
      }

      // Also detect pipeline PLAYING
      if (t.includes('pipeline') && t.includes('state-changed') && t.includes('PAUSED PLAYING')) {
        if (currentState !== 'mirroring') {
          log(`MIRRORING EVENT: Pipeline state-changed to PLAYING`)
          broadcast('mirroring', 'iPhone')
          startFrameWatcher()
        }
      }

      // ── DISCONNECT: only explicit renderer stop
      if (t.includes('video_renderer_stop')) {
        log(`DISCONNECT EVENT: video_renderer_stop signaled`)
        stopFrameWatcher()
        clearFrame()
        broadcast('waiting')
        setTimeout(() => startUxPlay(), 3000)
        return
      }

      // Also catch TCP socket close (hard disconnect)
      if (t.includes('tcp socket was closed by client')) {
        log(`DISCONNECT EVENT: TCP socket closed by client`)
        stopFrameWatcher()
        clearFrame()
        broadcast('waiting')
        setTimeout(() => startUxPlay(), 3000)
        return
      }
    }
  }

  uxplay.stdout?.on('data', handleOutput)
  uxplay.stderr?.on('data', handleOutput)

  uxplay.on('close', (code) => {
    if (code !== null) {
      log(`UxPlay exited (${code}). Restarting...`)
      stopFrameWatcher(); clearFrame(); broadcast('waiting')
      setTimeout(() => startUxPlay(), 3000)
    }
  })
}

startUxPlay()
log(`WebSocket → ws://localhost:${WS_PORT}`)
log(`Connect: iPhone → Screen Mirroring → "${DEVICE_NAME}"`)
log(`Dashboard: http://localhost:3000`)
log(`Full log: ${LOG_PATH}`)
log('')

process.on('SIGINT', () => {
  uxplay?.kill(); wss.close(); frameServer.close()
  stopFrameWatcher(); clearFrame(); logStream.end()
  process.exit()
})
