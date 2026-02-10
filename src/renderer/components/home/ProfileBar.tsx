import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { getStreakMultiplier } from '../../lib/xp'
import { skillLevelFromXP, MAX_TOTAL_SKILL_LEVEL } from '../../lib/skills'
import { detectPersona } from '../../lib/persona'
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
  const [persona, setPersona] = useState<{ emoji: string; label: string; description: string } | null>(null)
  const [showPersonaTooltip, setShowPersonaTooltip] = useState(false)
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
    if (api?.db?.getCategoryStats) {
      api.db.getCategoryStats().then((cats) => {
        const p = detectPersona((cats || []) as { category: string; total_ms: number }[])
        setPersona(p)
      })
    } else {
      setPersona(detectPersona([]))
    }
  }, [user])

  if (!supabase || !user) return null

  return (
    <div className={`flex flex-col items-center px-3 pt-3 pb-3 transition-opacity duration-150 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Top row: avatar + info + sign out — overflow hidden so tooltips don't expand window */}
      <div className="flex items-center justify-between gap-3 w-full border border-white/10 rounded-full px-3 py-2 bg-discord-card/30">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Avatar */}
          <button onClick={() => { playClickSound(); onNavigateProfile?.() }} className={`relative shrink-0 ${activeFrame ? `frame-style-${activeFrame.style}` : ''}`} title="Profile">
            {activeFrame && (
              <div className="frame-ring absolute -inset-1 rounded-full" style={{ background: activeFrame.gradient, opacity: 0.7, color: activeFrame.color, borderColor: activeFrame.color }} />
            )}
            <div
              className={`frame-avatar relative w-8 h-8 rounded-full bg-discord-card flex items-center justify-center text-base hover:scale-105 transition-transform ${
                activeFrame ? 'border-2' : 'border border-white/10'
              }`}
              style={activeFrame ? { borderColor: activeFrame.color } : undefined}
            >
              {avatar}
            </div>
          </button>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-xs leading-none truncate">{username}</span>

              <span className="text-cyber-neon font-mono text-[10px] leading-none cursor-default" title="Total skill level">
                {totalSkillLevel}/{MAX_TOTAL_SKILL_LEVEL}
              </span>

              {persona && (
                <div className="relative shrink-0 flex items-center" onMouseEnter={() => setShowPersonaTooltip(true)} onMouseLeave={() => setShowPersonaTooltip(false)}>
                  <span 
                    className="text-[9px] w-5 h-5 rounded-sm cursor-default flex items-center justify-center"
                    style={{
                      backgroundColor: persona.id === 'idly' ? 'rgba(234, 179, 8, 0.15)' : 
                                       persona.id === 'developer' ? 'rgba(139, 92, 246, 0.15)' :
                                       persona.id === 'creative' ? 'rgba(236, 72, 153, 0.15)' :
                                       persona.id === 'gamer' ? 'rgba(34, 197, 94, 0.15)' :
                                       persona.id === 'social' ? 'rgba(59, 130, 246, 0.15)' :
                                       persona.id === 'explorer' ? 'rgba(14, 165, 233, 0.15)' :
                                       persona.id === 'music_lover' ? 'rgba(168, 85, 247, 0.15)' :
                                       persona.id === 'scholar' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: persona.id === 'idly' ? 'rgba(234, 179, 8, 0.3)' : 
                                   persona.id === 'developer' ? 'rgba(139, 92, 246, 0.3)' :
                                   persona.id === 'creative' ? 'rgba(236, 72, 153, 0.3)' :
                                   persona.id === 'gamer' ? 'rgba(34, 197, 94, 0.3)' :
                                   persona.id === 'social' ? 'rgba(59, 130, 246, 0.3)' :
                                   persona.id === 'explorer' ? 'rgba(14, 165, 233, 0.3)' :
                                   persona.id === 'music_lover' ? 'rgba(168, 85, 247, 0.3)' :
                                   persona.id === 'scholar' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    {persona.emoji}
                  </span>
                  {showPersonaTooltip && (
                    <div className="absolute left-0 top-full mt-1.5 w-44 px-2.5 py-2 rounded-lg bg-discord-card border border-white/10 text-[10px] text-gray-300 z-20 shadow-xl pointer-events-none">
                      <p className="font-medium text-white">{persona.emoji} {persona.label}</p>
                      <p className="text-gray-500 mt-1 leading-relaxed break-words">
                        By activity. We analyze what you do and show your focus profile.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {badgeIds.map(bId => {
                const badge = BADGES.find(b => b.id === bId)
                return badge ? (
                  <span key={bId} className="text-[8px] leading-none px-1 py-0.5 rounded-md border font-medium"
                    style={{ borderColor: `${badge.color}30`, backgroundColor: `${badge.color}10`, color: badge.color }} title={badge.name}>
                    {badge.icon}
                  </span>
                ) : null
              })}

            </div>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={() => signOut()} className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-discord-red hover:bg-white/5 transition-all border border-white/10 shrink-0" title="Sign out">
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
