'use client'

import React from 'react'
import { Monitor, Smartphone, Activity, Zap } from 'lucide-react'

const Dashboard = () => {
  const [isMirroring, setIsMirroring] = React.useState(false)
  const [devices, setDevices] = React.useState<string[]>([])

  const handleStartMirroring = () => {
    setIsMirroring(true)
    // Mock discovery after 500ms
    setTimeout(() => {
      setDevices(['iPhone 15 Pro'])
    }, 500)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-purple-500/30">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            GravityStream
          </h1>
          <p className="text-gray-500 mt-2">Native FireTV Mirroring Dashboard</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <Activity className={`w-4 h-4 ${isMirroring ? 'text-purple-400 animate-spin' : 'text-green-400 animate-pulse'}`} />
          <span className="text-sm font-medium">{isMirroring ? 'Mirroring Active' : 'Ready to Connect'}</span>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Control - Pro Max Style */}
        <section className="col-span-1 md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl group hover:border-purple-500/50 transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <Zap className={`w-8 h-8 ${isMirroring ? 'text-yellow-400' : 'text-purple-400'}`} />
            </div>
            <button 
              onClick={handleStartMirroring}
              disabled={isMirroring}
              className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Mirroring
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-2">Mirror from Mobile or PC</h2>
          <p className="text-gray-400">Stream your screen directly to this FireTV with virtually zero latency. No apps required.</p>
        </section>

        {/* Discovery Section */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">Nearby Devices</h3>
          </div>
          <ul className="space-y-4">
            {devices.length === 0 ? (
              <li className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                <div className="w-2 h-2 rounded-full bg-gray-600" />
                <span className="text-gray-400 italic">Searching for devices...</span>
              </li>
            ) : (
              devices.map((device, idx) => (
                <li key={idx} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-4">
                    <Monitor className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">{device}</span>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">Connected</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>

      <footer className="mt-12 pt-8 border-t border-white/5 text-gray-600 text-sm flex justify-between">
        <p>© 2026 GravityStream. Native Mirroring Protocol v1.0</p>
        <div className="flex gap-6">
          <span>AirPlay</span>
          <span>Google Cast</span>
          <span>DLNA</span>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
