import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { getStreakMultiplier } from '../../lib/xp'
import { skillLevelFromXP, MAX_TOTAL_SKILL_LEVEL } from '../../lib/skills'
import { FRAMES, BADGES, getEquippedFrame, getEquippedBadges } from '../../lib/cosmetics'
import { playClickSound } from '../../lib/sounds'

interface ProfileBarProps {
  onNavigateProfile?: () => void
}

export function ProfileBar({ onNavigateProfile }: ProfileBarProps) {
  const { user, signOut } = useAuthStore()
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('🤖')
  const [totalSkillLevel, setTotalSkillLevel] = useState(0)
  const [showBadgeTooltip, setShowBadgeTooltip] = useState<string | null>(null)
  const [frameId, setFrameId] = useState<string | null>(null)
  const [badgeIds, setBadgeIds] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const activeFrame = FRAMES.find(f => f.id === frameId)
  const streakMult = getStreakMultiplier(streak)

  useEffect(() => {
    if (supabase && user) {
      supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUsername(data.username || 'Idly')
          setAvatar(data.avatar_url || '🤖')
        }
        setLoaded(true)
      }).catch(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
    const api = window.electronAPI
    if (api?.db?.getAllSkillXP) {
      api.db.getAllSkillXP().then((rows: { skill_id: string; total_xp: number }[]) => {
        const sum = (rows || []).reduce((s, r) => s + skillLevelFromXP(r.total_xp), 0)
        setTotalSkillLevel(sum)
      })
    }
    setFrameId(getEquippedFrame())
    setBadgeIds(getEquippedBadges())
    if (api?.db?.getStreak) {
      api.db.getStreak().then((s: number) => setStreak(s || 0))
    }
  }, [user])

  if (!supabase || !user) return null

  return (
    <div className={`flex flex-col items-center px-3 pt-3 pb-2 transition-opacity duration-150 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-3 w-full">

        {/* Avatar — matches ProfilePage card style: rounded-lg, solid border, vivid ring */}
        <button
          onClick={() => { playClickSound(); onNavigateProfile?.() }}
          className={`relative shrink-0 w-10 h-10 flex items-center justify-center ${
            activeFrame ? `frame-style-${activeFrame.style}` : ''
          }`}
          title="Profile"
        >
          {activeFrame && (
            <div
              className="frame-ring absolute inset-0 rounded-lg"
              style={{ background: activeFrame.gradient, opacity: 0.8, color: activeFrame.color, borderColor: activeFrame.color }}
            />
          )}
          <div
            className={`frame-avatar relative w-8 h-8 rounded-lg bg-discord-darker flex items-center justify-center text-lg leading-none ${
              activeFrame ? 'border' : 'border border-white/10'
            }`}
            style={activeFrame ? { borderColor: activeFrame.color } : undefined}
          >
            {avatar}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-discord-darker z-10" />
        </button>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Row 1: name + level */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-white font-semibold text-sm leading-[1.3] truncate pb-0.5">{username}</span>
            <span className="text-cyber-neon font-mono text-[10px] leading-none cursor-default" title="Total skill level">
              {totalSkillLevel}/{MAX_TOTAL_SKILL_LEVEL}
            </span>
          </div>
          {/* Row 2: badges + streak */}
          <div className="flex items-center gap-1 mt-px">
            {badgeIds.map(bId => {
              const badge = BADGES.find(b => b.id === bId)
              return badge ? (
                <div key={bId} className="relative shrink-0 flex items-center" onMouseEnter={() => setShowBadgeTooltip(bId)} onMouseLeave={() => setShowBadgeTooltip(null)}>
                  <span className="w-[18px] h-[18px] flex items-center justify-center text-[10px] leading-none rounded border font-medium cursor-default"
                    style={{ borderColor: `${badge.color}40`, backgroundColor: `${badge.color}15`, color: badge.color }}>
                    {badge.icon}
                  </span>
                  {showBadgeTooltip === bId && (
                    <div className="absolute left-0 top-full mt-1.5 w-36 px-2.5 py-2 rounded-lg bg-discord-card border border-white/10 text-[10px] text-gray-300 z-20 shadow-xl pointer-events-none">
                      <p className="font-medium text-white">{badge.icon} {badge.name}</p>
                      <p className="text-gray-500 mt-1 leading-relaxed break-words">
                        {badge.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : null
            })}

            {streak > 1 && (
              <span className="text-[10px] text-orange-400/80 font-mono leading-none">🔥{streak}d</span>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={() => signOut()} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-discord-red hover:bg-white/5 transition-all shrink-0" title="Sign out">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

    </div>
  )
}
