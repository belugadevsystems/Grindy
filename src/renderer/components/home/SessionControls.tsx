import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../../stores/sessionStore'
import { playClickSound } from '../../lib/sounds'

interface SessionControlsProps {
  glowPulse?: boolean
}

export function SessionControls({ glowPulse }: SessionControlsProps) {
  const { status, elapsedSeconds, start, stop, pause, resume } = useSessionStore()
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isActive = isRunning || isPaused
  const [confirmState, setConfirmState] = useState<'none' | 'discard' | 'confirm'>('none')

  const handleStartStop = () => {
    if (isActive) {
      playClickSound()
      if (elapsedSeconds < 30) {
        setConfirmState('discard')
        return
      }
      setConfirmState('confirm')
    } else {
      start()
      playClickSound()
    }
  }

  const handleConfirmStop = () => {
    playClickSound()
    setConfirmState('none')
    stop()
  }

  const handleCancel = () => {
    playClickSound()
    setConfirmState('none')
  }

  const handlePauseResume = () => {
    playClickSound()
    if (isPaused) resume()
    else pause()
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Backdrop overlay */}
      <AnimatePresence>
        {confirmState !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-[35]"
          />
        )}
      </AnimatePresence>

      {/* Confirmation dialog — absolute, doesn't push buttons */}
      <AnimatePresence>
        {confirmState !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 rounded-2xl p-4 w-72 z-[36] shadow-xl border border-amber-500/25 bg-gradient-to-b from-[#2a2520] to-[#1e1e2e]"
          >
            <p className="text-sm font-semibold text-center mb-1 text-amber-200">
              {confirmState === 'discard' ? 'Session under 30s' : 'Stop grinding?'}
            </p>
            <p className="text-xs text-gray-400 text-center mb-4">
              {confirmState === 'discard'
                ? 'This session is too short to save. Discard it?'
                : 'End this grind session and save progress?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl border-2 border-white/20 bg-white/5 text-sm text-white font-medium hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
              >
                Continue
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 py-2.5 rounded-xl bg-discord-red text-white text-sm font-bold hover:bg-red-500 shadow-[0_0_16px_rgba(237,66,69,0.4)] transition-all active:scale-95"
              >
                I'm done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main controls — centered */}
      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          {glowPulse && (
            <div className="absolute -inset-2 rounded-[20px] animate-glow-pulse pointer-events-none" />
          )}
          <button
            onClick={handleStartStop}
            className={`relative rounded-2xl font-bold transition-colors duration-150 active:scale-[0.93] ${
              isActive
                ? 'w-[95px] h-[42px] text-sm bg-discord-red text-white hover:bg-red-600'
                : 'min-w-[160px] px-10 py-4 text-base bg-cyber-neon text-discord-darker shadow-glow hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]'
            }`}
          >
            {isActive ? 'STOP' : 'GRIND'}
          </button>
        </div>
        {isActive && (
          <button
            onClick={handlePauseResume}
            className="w-[95px] h-[42px] rounded-2xl font-bold text-[13px] whitespace-nowrap transition-all duration-150 active:scale-95 border-2 border-[#5865F2]/50 bg-[#5865F2]/15 text-white hover:bg-[#5865F2]/25 hover:border-[#5865F2]/70 hover:shadow-[0_0_20px_rgba(88,101,242,0.2)] flex items-center justify-center pt-0.5"
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        )}
      </div>
    </div>
  )
}
