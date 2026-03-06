'use client'

import React, { useState, useEffect } from 'react'
import { Monitor, Smartphone, Activity, Zap, Wifi, Layers, Share2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const BentoCard = ({ children, className = '', title = '', icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-2xl hover:border-purple-500/30 transition-all group overflow-hidden relative ${className}`}
  >
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
      {Icon && <Icon className="w-16 h-16" />}
    </div>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-xl">
          {Icon && <Icon className="w-5 h-5 text-purple-400" />}
        </div>
        <h3 className="text-xl font-bold text-white/90">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
)

const Dashboard = () => {
  const [isMirroring, setIsMirroring] = useState(false)
  const [devices, setDevices] = useState<string[]>([])
  const [latency, setLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(24, Math.floor(prev + (Math.random() * 4 - 2)))))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleStartMirroring = () => {
    setIsMirroring(true)
    setTimeout(() => {
      setDevices(['iPhone 15 Pro'])
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" 
        />
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic"
          >
            GRAVITY
          </motion.h1>
          <p className="text-white/40 font-medium tracking-widest text-xs uppercase">Native Mirroring Intelligence</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-3xl backdrop-blur-3xl"
        >
          <div className="relative">
            <Activity className={`w-4 h-4 ${isMirroring ? 'text-purple-400 animate-spin' : 'text-green-400 animate-pulse'}`} />
            {isMirroring && <div className="absolute inset-0 bg-purple-500 blur-sm animate-pulse rounded-full opacity-50" />}
          </div>
          <span className="text-sm font-bold tracking-tight uppercase">{isMirroring ? 'Mirroring Active' : 'System Ready'}</span>
        </motion.div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto gap-6 max-w-7xl mx-auto">
        {/* Main Control Station */}
        <BentoCard className="md:col-span-3 md:row-span-2 group/main bg-gradient-to-br from-purple-600/10 to-transparent">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-purple-500/20 rounded-3xl">
                <Share2 className={`w-10 h-10 ${isMirroring ? 'text-yellow-400' : 'text-purple-400'}`} />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartMirroring}
                disabled={isMirroring}
                className="group/btn relative px-12 py-4 bg-white text-black font-black rounded-3xl overflow-hidden disabled:opacity-50"
              >
                <span className="relative z-10 uppercase tracking-tighter">Start Mirroring</span>
                <motion.div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500 origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform" />
              </motion.button>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight">Broadcast to your FireTV<br/><span className="text-white/30">No Apps. No Latency.</span></h2>
              <div className="flex gap-4 opacity-50 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> 4K Stream</span>
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> 5GHz Optimized</span>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Network Metrics Card */}
        <BentoCard title="Network Latency" icon={Wifi} className="md:col-span-1">
          <div className="flex flex-col items-center justify-center p-4">
            <motion.div 
              key={latency}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl font-black text-purple-400 tabular-nums"
            >
              {latency}<span className="text-xl text-white/20 ml-1">ms</span>
            </motion.div>
            <p className="text-xs font-bold text-white/30 uppercase mt-4">Real-time Ping</p>
          </div>
        </BentoCard>

        {/* Active Devices */}
        <BentoCard title="Nearby Devices" icon={Smartphone} className="md:col-span-1">
          <ul className="space-y-3">
            <AnimatePresence mode="popLayout">
              {devices.length === 0 ? (
                <motion.li 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="empty"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                  <span className="text-white/20 text-xs font-bold uppercase tracking-wider">Listening...</span>
                </motion.li>
              ) : (
                devices.map((device, idx) => (
                  <motion.li 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={device}
                    className="flex flex-col gap-2 p-4 bg-white/10 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm tracking-tight">{device}</span>
                      </div>
                      <span className="text-[10px] bg-white text-black font-black px-2 py-0.5 rounded-full uppercase">Live</span>
                    </div>
                  </motion.li>
                ))
              )}
            </AnimatePresence>
          </ul>
        </BentoCard>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-white/20 font-bold text-[10px] uppercase tracking-[0.2em]">
        <p>© 2026 Gravity Protocol Inc. / PRO MAX EDITION</p>
        <div className="flex gap-12">
          <span className="hover:text-purple-400 cursor-pointer transition-colors">AirPlay 2</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Google Cast</span>
          <span className="hover:text-white cursor-pointer transition-colors">UPnP/DLNA</span>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
