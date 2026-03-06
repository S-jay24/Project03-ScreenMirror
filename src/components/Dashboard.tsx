'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Monitor, Smartphone, Activity, Wifi, Tv, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ConnectionState = 'waiting' | 'connected' | 'mirroring'

const STATE_LABELS: Record<ConnectionState, string> = {
  waiting: 'Ready to Connect',
  connected: 'Device Connected',
  mirroring: 'Mirroring Active',
}

const STATE_COLORS: Record<ConnectionState, string> = {
  waiting: 'text-blue-400',
  connected: 'text-yellow-400',
  mirroring: 'text-purple-400',
}

const Dashboard = () => {
  const [devices, setDevices] = useState<string[]>([])
  const [latency, setLatency] = useState(12)
  const [connState, setConnState] = useState<ConnectionState>('waiting')
  const [connDevice, setConnDevice] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Latency sim
  useEffect(() => {
    const i = setInterval(() => setLatency(p => Math.max(8, Math.min(24, Math.floor(p + Math.random() * 4 - 2)))), 2000)
    return () => clearInterval(i)
  }, [])

  // ── Start/stop frame polling
  const startFramePolling = useCallback(() => {
    if (frameTimerRef.current) return
    frameTimerRef.current = setInterval(() => {
      if (imgRef.current) {
        imgRef.current.src = `http://localhost:7300/frame?t=${Date.now()}`
      }
    }, 50) // ~20fps polling
  }, [])

  const stopFramePolling = useCallback(() => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current)
      frameTimerRef.current = null
    }
  }, [])

  // ── WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout>

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:7200')
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data)
            if (msg.event === 'connection') {
              const state = msg.state as ConnectionState
              setConnState(state)
              if (state === 'waiting') {
                setDevices([]); setConnDevice(null)
                stopFramePolling()
              } else if (state === 'connected' || state === 'mirroring') {
                if (msg.deviceName) { setConnDevice(msg.deviceName); setDevices([msg.deviceName]) }
              }
              if (state === 'mirroring') startFramePolling()
            }
          } catch {}
        }
        ws.onclose = () => { timer = setTimeout(connect, 2000) }
        ws.onerror = () => ws?.close()
      } catch {}
    }
    connect()
    return () => { ws?.close(); clearTimeout(timer); stopFramePolling() }
  }, [startFramePolling, stopFramePolling])

  const isMirroring = connState === 'mirroring'

  // ── When mirroring, take over the ENTIRE viewport (CSS fullscreen)
  if (isMirroring) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {/* The mirrored screen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          alt="Mirror"
          className="max-w-full max-h-full object-contain"
        />

        {/* Top overlay bar */}
        <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-50">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-bold uppercase tracking-wider">Live Mirror — {connDevice}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs font-bold">{latency}ms</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Normal Dashboard (waiting / connecting)
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity, delay: 5 }} className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div className="space-y-2">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">GRAVITY</motion.h1>
          <p className="text-white/40 font-medium tracking-widest text-xs uppercase">Native Mirroring Intelligence</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-3xl backdrop-blur-3xl">
          <Activity className={`w-4 h-4 ${STATE_COLORS[connState]} ${connState !== 'waiting' ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-bold tracking-tight uppercase">{STATE_LABELS[connState]}</span>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Main Panel */}
        <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl min-h-[500px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {connState === 'waiting' && (
              <motion.div key="w" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8 text-center">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.08, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -inset-8 bg-purple-500/20 rounded-full blur-3xl" />
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] relative z-10">
                    <Tv className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
                <h2 className="text-4xl font-black tracking-tight">Ready to Receive</h2>
                <p className="text-white/30 text-lg max-w-md">Open <strong className="text-white/50">Screen Mirroring</strong> on your device and select <strong className="text-purple-400">GravityStream-TV</strong></p>
                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Scanning for devices…</span>
                </div>
              </motion.div>
            )}

            {connState === 'connected' && (
              <motion.div key="c" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full" />
                <h2 className="text-3xl font-black">Connecting…</h2>
                <p className="text-white/30">{connDevice} is establishing a secure connection</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side panels */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Latency */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl"><Wifi className="w-5 h-5 text-purple-400" /></div>
              <h3 className="text-xl font-bold text-white/90">Latency</h3>
            </div>
            <div className="flex flex-col items-center py-4">
              <div className="text-6xl font-black text-purple-400 tabular-nums">{latency}<span className="text-xl text-white/20 ml-1">ms</span></div>
              <p className="text-xs font-bold text-white/30 uppercase mt-4">Real-time</p>
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-xl"><Smartphone className="w-5 h-5 text-purple-400" /></div>
              <h3 className="text-xl font-bold text-white/90">Devices</h3>
            </div>
            {devices.length === 0 ? (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                <span className="text-white/20 text-xs font-bold uppercase tracking-wider">Listening...</span>
              </div>
            ) : devices.map(d => (
              <div key={d} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-sm">{d}</span>
                </div>
                <span className="text-[10px] bg-white text-black font-black px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/10 text-center text-white/20 font-bold text-[10px] uppercase tracking-[0.2em]">
        © 2026 Gravity Protocol Inc.
      </footer>
    </div>
  )
}

export default Dashboard
