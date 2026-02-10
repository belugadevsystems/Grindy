import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProfileBar } from './ProfileBar'
import { Timer } from './Timer'
import { SessionControls } from './SessionControls'
import { CurrentActivity } from './CurrentActivity'
import { SessionComplete } from './SessionComplete'
import { MotivationBanner } from './MotivationBanner'
import { WelcomeBanner } from './WelcomeBanner'
import { GoalWidget } from './GoalWidget'
import { MiniChatWidget } from './MiniChatWidget'
import { useSessionStore } from '../../stores/sessionStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import mascotImg from '../../assets/mascot.png'

interface HomePageProps {
  onNavigateProfile: () => void
}

export function HomePage({ onNavigateProfile }: HomePageProps) {
  const { showComplete, setCurrentActivity, status } = useSessionStore()
  const { user } = useAuthStore()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const welcomed = localStorage.getItem('idly_welcomed')
    if (!welcomed) setShowWelcome(true)
  }, [])

  useEffect(() => {
    if (status === 'running' && showWelcome) {
      const t = setTimeout(() => {
        localStorage.setItem('idly_welcomed', '1')
        setShowWelcome(false)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [status, showWelcome])

  const handleDismissWelcome = () => {
    localStorage.setItem('idly_welcomed', '1')
    setShowWelcome(false)
  }

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.electronAPI : null
    if (!api?.tracker?.onActivityUpdate) return
    const unsub = api.tracker.onActivityUpdate((a) => {
      setCurrentActivity(a as Parameters<typeof setCurrentActivity>[0])
    })
    api.tracker.getCurrentActivity?.().then((a) => {
      if (a) setCurrentActivity(a as Parameters<typeof setCurrentActivity>[0])
    }).catch(() => {})
    return unsub
  }, [setCurrentActivity])

  return (
    <div className="flex flex-col h-full">
      <ProfileBar onNavigateProfile={onNavigateProfile} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
        {/* Top: mascot + banner */}
        <div className="flex flex-col items-center w-full px-2">
          {showWelcome && status === 'idle' ? (
            <WelcomeBanner onDismiss={handleDismissWelcome} />
          ) : (
            <>
              <img
                src={mascotImg}
                alt=""
                className="w-12 h-12 mb-1"
                draggable={false}
              />
              <MotivationBanner isRunning={status !== 'idle'} />
            </>
          )}
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <Timer />
        </div>

        {/* Controls + activity / Browser Mode */}
        <div className="flex flex-col items-center gap-3">
          <SessionControls glowPulse={showWelcome && status === 'idle'} />
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-3"
              >
                <CurrentActivity />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Goal */}
        <div className="flex flex-col items-center w-full max-w-xs">
          <GoalWidget />
        </div>
      </div>

      <AnimatePresence>
        {showComplete && <SessionComplete />}
      </AnimatePresence>

      {/* Mini Chat Widget - only show when authenticated and Supabase is configured */}
      {user && supabase && <MiniChatWidget />}

    </div>
  )
}
