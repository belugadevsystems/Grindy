import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthGate } from './components/auth/AuthGate'
import { useProfileSync, usePresenceSync } from './hooks/useProfileSync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { BottomNav } from './components/layout/BottomNav'
import { HomePage } from './components/home/HomePage'
import { StatsPage } from './components/stats/StatsPage'
import { FriendsPage } from './components/friends/FriendsPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { SettingsPage } from './components/settings/SettingsPage'
import { SkillsPage } from './components/skills/SkillsPage'
import { StreakOverlay } from './components/animations/StreakOverlay'
import { LootDrop } from './components/alerts/LootDrop'
import { FriendToasts } from './components/alerts/FriendToasts'
import { SkillLevelUpModal } from './components/home/SkillLevelUpModal'
import { MiniChatWidget } from './components/home/MiniChatWidget'
import { useFriends } from './hooks/useFriends'
import { useChat } from './hooks/useChat'
import { UpdateBanner } from './components/UpdateBanner'
import { useSessionStore } from './stores/sessionStore'
import { categoryToSkillId, getSkillById } from './lib/skills'
import { warmUpAudio } from './lib/sounds'

export type TabId = 'home' | 'skills' | 'stats' | 'profile' | 'friends' | 'settings'

// Module-level flag — survives ALL React remounts, only resets on full app restart
let _streakDoneThisSession = false

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [showStreak, setShowStreak] = useState(false)
  const [streakCount, setStreakCount] = useState(0)

  // Global presence: always is_online while app is open
  const { status, currentActivity, setCurrentActivity } = useSessionStore()
  const presenceLabel = currentActivity && status === 'running'
    ? (() => {
      const skill = getSkillById(categoryToSkillId(currentActivity.category))
      return skill ? `Leveling ${skill.name}` : null
    })()
    : null
  usePresenceSync(presenceLabel, status === 'running', currentActivity?.appName ?? null)

  useProfileSync()
  useKeyboardShortcuts()
  useFriends() // run so friend presence polling + milestone toasts work on all tabs
  useChat(null) // run so message badges and realtime updates work on all tabs

  // Global activity listener — must live here (not HomePage) so updates arrive on ALL tabs
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

  // Pre-warm audio context on first user gesture
  useEffect(() => {
    const handler = () => {
      warmUpAudio()
      window.removeEventListener('pointerdown', handler)
    }
    window.addEventListener('pointerdown', handler, { once: true })
    return () => window.removeEventListener('pointerdown', handler)
  }, [])

  // Check streak once on app startup
  useEffect(() => {
    if (_streakDoneThisSession) return
    _streakDoneThisSession = true

    const checkStreak = async () => {
      const api = window.electronAPI
      if (!api?.db?.getStreak || !api?.db?.getLocalStat || !api?.db?.setLocalStat) return

      const today = new Date().toLocaleDateString('sv-SE')
      const browserStoredDate = localStorage.getItem('streak_shown_date')
      if (browserStoredDate === today) return

      try {
        const savedDate = await api.db.getLocalStat('streak_shown_date')
        if (savedDate === today) {
          localStorage.setItem('streak_shown_date', today)
          return
        }

        const streak = await api.db.getStreak()
        if (streak >= 2) {
          await api.db.setLocalStat('streak_shown_date', today)
          localStorage.setItem('streak_shown_date', today)
          setStreakCount(streak)
          setShowStreak(true)
        }
      } catch (e) {
        console.error('Failed to check streak:', e)
      }
    }

    checkStreak()
  }, [])

  const handleNavigateProfile = useCallback(() => setActiveTab('profile'), [])

  useEffect(() => {
    useSessionStore.getState().setGrindPageActive(activeTab === 'home')
  }, [activeTab])

  return (
    <AuthGate>
      <div className="relative h-full w-full bg-discord-darker overflow-hidden">
        <UpdateBanner />
        <main className="absolute inset-0 overflow-y-auto overflow-x-hidden pb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <HomePage
                key="home"
                onNavigateProfile={handleNavigateProfile}
              />
            )}
            {activeTab === 'skills' && <SkillsPage key="skills" />}
            {activeTab === 'stats' && <StatsPage key="stats" />}
            {activeTab === 'profile' && <ProfilePage key="profile" onBack={() => setActiveTab('home')} />}
            {activeTab === 'friends' && <FriendsPage key="friends" />}
            {activeTab === 'settings' && <SettingsPage key="settings" />}
          </AnimatePresence>
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <AnimatePresence>
          {showStreak && streakCount >= 2 && (
            <StreakOverlay streak={streakCount} onClose={() => setShowStreak(false)} />
          )}
        </AnimatePresence>
        <LootDrop />
        <FriendToasts />
        <SkillLevelUpModal />
        <MiniChatWidget />
      </div>
    </AuthGate>
  )
}
