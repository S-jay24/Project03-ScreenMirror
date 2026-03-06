/**
 * GravityStream — Video Relay
 *
 * Receives RTP H.264 packets from UxPlay (UDP :5000)
 * and forwards the raw NAL units to the Dashboard via WebSocket (binary).
 *
 * Run: npx ts-node src/lib/video-relay.ts
 */

import dgram from 'node:dgram'
import { WebSocketServer } from 'ws'

const UDP_PORT = 5000
const WS_PORT = 7200

// ─── WebSocket server for Dashboard ──────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT })
let clientCount = 0

wss.on('connection', (ws) => {
  clientCount++
  console.log(`🌐 Dashboard connected (${clientCount} client(s))`)
  ws.on('close', () => {
    clientCount--
    console.log(`🌐 Dashboard disconnected (${clientCount} client(s))`)
  })
})

// ─── UDP listener for RTP packets from UxPlay ────────────────────────────────
const udp = dgram.createSocket('udp4')

udp.on('message', (msg) => {
  // RTP header is 12 bytes; payload after that is H.264 NAL unit(s)
  if (msg.length <= 12) return

  const payload = msg.subarray(12) // Strip RTP header

  // Forward raw H.264 to all connected Dashboard clients
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload, { binary: true })
    }
  })
})

udp.on('listening', () => {
  console.log(`📡 UDP relay listening on port ${UDP_PORT} (← UxPlay RTP)`)
  console.log(`🔌 WebSocket server on ws://localhost:${WS_PORT} (→ Dashboard)`)
  console.log(`📱 Connect your iPhone to GravityStream-TV and open http://localhost:3000`)
})

udp.bind(UDP_PORT)
