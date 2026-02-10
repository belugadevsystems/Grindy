// ─── BADGES ───────────────────────────────────────────────
// Badges are small profile decorations visible to friends and on leaderboards.
// Unlocked through achievements or special events.

export interface Badge {
  id: string
  name: string
  label: string       // short text shown on badge
  icon: string
  color: string
  description: string
  unlockHint: string   // shown when locked
  achievementId?: string // linked to an achievement
}

export const BADGES: Badge[] = [
  {
    id: 'fire',
    name: 'On Fire',
    label: 'FIRE',
    icon: '🔥',
    color: '#FF6B35',
    description: '2-day streak achieved',
    unlockHint: 'Get a 2-day streak',
    achievementId: 'streak_2',
  },
  {
    id: 'lightning',
    name: 'Streak Master',
    label: 'STREAK',
    icon: '⚡',
    color: '#FFD700',
    description: '7-day streak achieved',
    unlockHint: 'Get a 7-day streak',
    achievementId: 'streak_7',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    label: 'UNSTOP',
    icon: '🌟',
    color: '#E040FB',
    description: '30-day streak achieved',
    unlockHint: 'Get a 30-day streak',
    achievementId: 'streak_30',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    label: 'OWL',
    icon: '🦉',
    color: '#5C6BC0',
    description: 'Grinds after midnight',
    unlockHint: 'Start a session past midnight',
    achievementId: 'night_owl',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    label: 'EARLY',
    icon: '🐦',
    color: '#FFB74D',
    description: 'Grinds before 7 AM',
    unlockHint: 'Start a session before 7 AM',
    achievementId: 'early_bird',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    label: 'IDLY',
    icon: '💎',
    color: '#4FC3F7',
    description: '10 sessions completed',
    unlockHint: 'Complete 10 sessions',
    achievementId: 'ten_sessions',
  },
  {
    id: 'lord',
    name: 'Grind Lord',
    label: 'LORD',
    icon: '👑',
    color: '#FFD700',
    description: '50 sessions completed',
    unlockHint: 'Complete 50 sessions',
    achievementId: 'fifty_sessions',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    label: 'MARATHON',
    icon: '🏃',
    color: '#66BB6A',
    description: '2+ hour session without breaks',
    unlockHint: 'Grind 2+ hours non-stop',
    achievementId: 'marathon',
  },
  {
    id: 'social',
    name: 'Social Butterfly',
    label: 'SOCIAL',
    icon: '🦋',
    color: '#CE93D8',
    description: '10 friends added',
    unlockHint: 'Add 10 friends',
    achievementId: 'social_butterfly',
  },
  {
    id: 'polymath',
    name: 'Polymath',
    label: 'POLY',
    icon: '🌟',
    color: '#AED581',
    description: '3 skills at Lv.25+',
    unlockHint: 'Get 3 skills to Lv.25+',
    achievementId: 'polymath',
  },
]

// ─── FRAMES ──────────────────────────────────────────────
// Frames are avatar borders. Limited/rare, only from specific achievements.

export type FrameStyle = 'pixel' | 'broken' | 'matrix' | 'liquid' | 'glitch' | 'holographic' | 'flame' | 'royal'

export interface Frame {
  id: string
  name: string
  color: string
  gradient: string
  rarity: 'Rare' | 'Epic' | 'Legendary'
  style: FrameStyle
  unlockHint: string
  achievementId?: string
}

export const FRAMES: Frame[] = [
  {
    id: 'diamond',
    name: 'Diamond',
    color: '#4FC3F7',
    gradient: 'linear-gradient(135deg, rgba(79, 195, 247, 0.3) 0%, rgba(225, 245, 254, 0.15) 40%, rgba(79, 195, 247, 0.3) 100%)',
    rarity: 'Rare',
    style: 'pixel',
    unlockHint: 'Complete 10 sessions',
    achievementId: 'ten_sessions',
  },
  {
    id: 'ember',
    name: 'Ember',
    color: '#FF8A65',
    gradient: 'linear-gradient(135deg, rgba(255, 138, 101, 0.3) 0%, rgba(255, 87, 34, 0.25) 50%, rgba(191, 54, 12, 0.2) 100%)',
    rarity: 'Rare',
    style: 'broken',
    unlockHint: '7-day streak',
    achievementId: 'streak_7',
  },
  {
    id: 'code',
    name: 'Code',
    color: '#00FF88',
    gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 180, 216, 0.25) 100%)',
    rarity: 'Epic',
    style: 'matrix',
    unlockHint: 'Developer Lv.50',
    achievementId: 'skill_developer_50',
  },
  {
    id: 'art',
    name: 'Art',
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, rgba(255, 107, 157, 0.3) 0%, rgba(192, 132, 252, 0.25) 100%)',
    rarity: 'Epic',
    style: 'liquid',
    unlockHint: 'Designer Lv.50',
    achievementId: 'skill_designer_50',
  },
  {
    id: 'blaze',
    name: 'Blaze',
    color: '#FF6D00',
    gradient: 'linear-gradient(135deg, rgba(255, 109, 0, 0.3) 0%, rgba(255, 61, 0, 0.25) 40%, rgba(221, 44, 0, 0.2) 70%, rgba(255, 215, 64, 0.15) 100%)',
    rarity: 'Epic',
    style: 'glitch',
    unlockHint: '14-day streak',
    achievementId: 'streak_14',
  },
  {
    id: 'star',
    name: 'Star',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 107, 53, 0.25) 50%, rgba(255, 20, 147, 0.2) 100%)',
    rarity: 'Legendary',
    style: 'holographic',
    unlockHint: '3 skills at Lv.25+',
    achievementId: 'polymath',
  },
  {
    id: 'fire',
    name: 'Inferno',
    color: '#FF4500',
    gradient: 'linear-gradient(135deg, rgba(255, 69, 0, 0.3) 0%, rgba(255, 215, 0, 0.25) 50%, rgba(255, 107, 53, 0.2) 100%)',
    rarity: 'Legendary',
    style: 'flame',
    unlockHint: '30-day streak',
    achievementId: 'streak_30',
  },
  {
    id: 'crown',
    name: 'Crown',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 160, 0, 0.25) 40%, rgba(255, 111, 0, 0.2) 100%)',
    rarity: 'Legendary',
    style: 'royal',
    unlockHint: 'Complete 50 sessions',
    achievementId: 'fifty_sessions',
  },
]

// ─── LOCKED AVATARS ──────────────────────────────────────
// Some avatars require achievements to unlock.

export const FREE_AVATARS = ['🐺', '🦊', '🐱', '🐼', '🐸', '🤖']

export const LOCKED_AVATARS: { emoji: string; unlockHint: string; achievementId: string }[] = [
  { emoji: '🔥', unlockHint: '2-day streak', achievementId: 'streak_2' },
  { emoji: '💀', unlockHint: '50 sessions', achievementId: 'fifty_sessions' },
  { emoji: '👾', unlockHint: '10 sessions', achievementId: 'ten_sessions' },
  { emoji: '🦁', unlockHint: '2h+ session', achievementId: 'marathon' },
  { emoji: '🐙', unlockHint: 'Night Owl', achievementId: 'night_owl' },
  { emoji: '🦉', unlockHint: 'Early Bird', achievementId: 'early_bird' },
]

// ─── LOCAL STORAGE HELPERS ────────────────────────────────

const STORAGE_BADGES = 'idly_equipped_badges'
const STORAGE_FRAME = 'idly_equipped_frame'
const STORAGE_UNLOCKED_BADGES = 'idly_unlocked_badges'
const STORAGE_UNLOCKED_FRAMES = 'idly_unlocked_frames'

export function getEquippedBadges(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_BADGES) || '[]') } catch { return [] }
}
export function equipBadge(id: string): void {
  const current = getEquippedBadges()
  if (!current.includes(id) && current.length < 3) {
    localStorage.setItem(STORAGE_BADGES, JSON.stringify([...current, id]))
  }
}
export function unequipBadge(id: string): void {
  const current = getEquippedBadges()
  localStorage.setItem(STORAGE_BADGES, JSON.stringify(current.filter(b => b !== id)))
}

export function getEquippedFrame(): string | null {
  return localStorage.getItem(STORAGE_FRAME) || null
}
export function equipFrame(id: string | null): void {
  if (id) localStorage.setItem(STORAGE_FRAME, id)
  else localStorage.removeItem(STORAGE_FRAME)
}

export function getUnlockedBadges(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_UNLOCKED_BADGES) || '[]') } catch { return [] }
}
export function getUnlockedFrames(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_UNLOCKED_FRAMES) || '[]') } catch { return [] }
}

export function getUnlockedAvatarEmojis(): string[] {
  try { return JSON.parse(localStorage.getItem('idly_unlocked_avatars') || '[]') } catch { return [] }
}

/** Call when an achievement is unlocked — checks if it grants a badge, frame, or avatar */
export function unlockCosmeticsFromAchievement(achievementId: string): void {
  // Check badges
  const badge = BADGES.find(b => b.achievementId === achievementId)
  if (badge) {
    const current = getUnlockedBadges()
    if (!current.includes(badge.id)) {
      localStorage.setItem(STORAGE_UNLOCKED_BADGES, JSON.stringify([...current, badge.id]))
    }
  }
  // Check frames
  const frame = FRAMES.find(f => f.achievementId === achievementId)
  if (frame) {
    const current = getUnlockedFrames()
    if (!current.includes(frame.id)) {
      localStorage.setItem(STORAGE_UNLOCKED_FRAMES, JSON.stringify([...current, frame.id]))
    }
  }
  // Check locked avatars
  const lockedAvatar = LOCKED_AVATARS.find(a => a.achievementId === achievementId)
  if (lockedAvatar) {
    const current = getUnlockedAvatarEmojis()
    if (!current.includes(lockedAvatar.emoji)) {
      localStorage.setItem('idly_unlocked_avatars', JSON.stringify([...current, lockedAvatar.emoji]))
    }
  }
}
