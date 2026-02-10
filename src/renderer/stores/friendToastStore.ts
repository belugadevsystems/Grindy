import { create } from 'zustand'

export type FriendToastType = 'online' | 'level_up' | 'xp_milestone'

export interface FriendToast {
  id: string
  type: FriendToastType
  friendName: string
  /** For level_up: new level reached */
  newLevel?: number
  /** For xp_milestone: XP amount reached */
  xpAmount?: number
  createdAt: number
}

const TOAST_TTL_MS = 4500
const MAX_TOASTS = 3

interface FriendToastStore {
  toasts: FriendToast[]
  push: (payload: { type: FriendToastType; friendName: string; newLevel?: number; xpAmount?: number }) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

export const useFriendToastStore = create<FriendToastStore>((set, get) => ({
  toasts: [],

  push(payload) {
    const id = crypto.randomUUID()
    const toast: FriendToast = {
      id,
      ...payload,
      createdAt: Date.now(),
    }
    set((s) => ({
      toasts: [...s.toasts, toast].slice(-MAX_TOASTS),
    }))
    setTimeout(() => {
      get().dismiss(id)
    }, TOAST_TTL_MS)
  },

  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },

  dismissAll() {
    set({ toasts: [] })
  },
}))
