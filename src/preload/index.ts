import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/ipcChannels'

const api = {
  tracker: {
    start: () => ipcRenderer.invoke(IPC_CHANNELS.tracker.start),
    stop: () => ipcRenderer.invoke(IPC_CHANNELS.tracker.stop),
    pause: () => ipcRenderer.invoke(IPC_CHANNELS.tracker.pause),
    resume: () => ipcRenderer.invoke(IPC_CHANNELS.tracker.resume),
    getCurrentActivity: () => ipcRenderer.invoke(IPC_CHANNELS.tracker.getCurrentActivity),
    setAfkThreshold: (ms: number) => ipcRenderer.invoke(IPC_CHANNELS.tracker.setAfkThreshold, ms),
    onActivityUpdate: (cb: (activity: unknown) => void) => {
      const handler = (_: unknown, activity: unknown) => cb(activity)
      ipcRenderer.on(IPC_CHANNELS.tracker.activityUpdate, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.tracker.activityUpdate, handler)
    },
    onIdleChange: (cb: (idle: boolean) => void) => {
      const handler = (_: unknown, idle: boolean) => cb(idle)
      ipcRenderer.on(IPC_CHANNELS.tracker.idleChange, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.tracker.idleChange, handler)
    },
  },
  db: {
    getSessions: (limit?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getSessions, limit),
    getSessionById: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getSessionById, id),
    getActivitiesBySessionId: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getActivitiesBySessionId, sessionId),
    saveSession: (session: { id: string; startTime: number; endTime: number; durationSeconds: number; summary?: unknown }) =>
      ipcRenderer.invoke(IPC_CHANNELS.db.saveSession, session),
    saveActivities: (sessionId: string, activities: unknown[]) => ipcRenderer.invoke(IPC_CHANNELS.db.saveActivities, sessionId, activities),
    getStreak: () => ipcRenderer.invoke(IPC_CHANNELS.db.getStreak),
    getUserStats: () => ipcRenderer.invoke(IPC_CHANNELS.db.getUserStats),
    getSessionAnalysis: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getSessionAnalysis, sessionId),
    getLocalStat: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getLocalStat, key),
    setLocalStat: (key: string, value: string) => ipcRenderer.invoke(IPC_CHANNELS.db.setLocalStat, key, value),
    getUnlockedAchievements: () => ipcRenderer.invoke(IPC_CHANNELS.db.getUnlockedAchievements),
    unlockAchievement: (achievementId: string) => ipcRenderer.invoke(IPC_CHANNELS.db.unlockAchievement, achievementId),
    getAppUsageStats: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getAppUsageStats, sinceMs),
    getCategoryStats: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getCategoryStats, sinceMs),
    getContextSwitchCount: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getContextSwitchCount, sinceMs),
    getSessionCount: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getSessionCount, sinceMs),
    getTotalSeconds: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getTotalSeconds, sinceMs),
    getWindowTitleStats: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getWindowTitleStats, sinceMs),
    getHourlyDistribution: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getHourlyDistribution, sinceMs),
    getTotalKeystrokes: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getTotalKeystrokes, sinceMs),
    getKeystrokesByApp: (sinceMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getKeystrokesByApp, sinceMs),
    getSkillXP: (skillId: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getSkillXP, skillId),
    addSkillXP: (skillId: string, amount: number) => ipcRenderer.invoke(IPC_CHANNELS.db.addSkillXP, skillId, amount),
    getAllSkillXP: () => ipcRenderer.invoke(IPC_CHANNELS.db.getAllSkillXP),
    // Goals
    getActiveGoals: () => ipcRenderer.invoke(IPC_CHANNELS.db.getActiveGoals),
    getAllGoals: () => ipcRenderer.invoke(IPC_CHANNELS.db.getAllGoals),
    createGoal: (goal: { id: string; type: string; target_seconds: number; target_category: string | null; period: string; start_date: string }) => ipcRenderer.invoke(IPC_CHANNELS.db.createGoal, goal),
    completeGoal: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.db.completeGoal, id),
    updateGoal: (goal: { id: string; target_seconds: number; target_category: string | null; period: string }) => ipcRenderer.invoke(IPC_CHANNELS.db.updateGoal, goal),
    deleteGoal: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.db.deleteGoal, id),
    getGoalProgress: (goal: { target_category: string | null; period: string; start_date: string }) => ipcRenderer.invoke(IPC_CHANNELS.db.getGoalProgress, goal),
    // Grind Tasks
    getTasks: () => ipcRenderer.invoke(IPC_CHANNELS.db.getTasks),
    createTask: (task: { id: string; text: string }) => ipcRenderer.invoke(IPC_CHANNELS.db.createTask, task),
    toggleTask: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.db.toggleTask, id),
    updateTaskText: (id: string, text: string) => ipcRenderer.invoke(IPC_CHANNELS.db.updateTaskText, id, text),
    deleteTask: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.db.deleteTask, id),
    clearDoneTasks: () => ipcRenderer.invoke(IPC_CHANNELS.db.clearDoneTasks),
    // Trends
    getDailyTotals: (days: number) => ipcRenderer.invoke(IPC_CHANNELS.db.getDailyTotals, days),
    // Skill XP Log
    addSkillXPLog: (skillId: string, xpDelta: number) => ipcRenderer.invoke(IPC_CHANNELS.db.addSkillXPLog, skillId, xpDelta),
    getSkillXPHistory: (skillId: string) => ipcRenderer.invoke(IPC_CHANNELS.db.getSkillXPHistory, skillId),
    // Session Checkpoint (crash recovery)
    saveCheckpoint: (data: { sessionId: string; startTime: number; elapsedSeconds: number; pausedAccumulated: number }) => ipcRenderer.invoke(IPC_CHANNELS.db.saveCheckpoint, data),
    getCheckpoint: () => ipcRenderer.invoke(IPC_CHANNELS.db.getCheckpoint),
    clearCheckpoint: () => ipcRenderer.invoke(IPC_CHANNELS.db.clearCheckpoint),
  },
  ai: {
    analyzeSession: (sessionId: string) => ipcRenderer.invoke(IPC_CHANNELS.ai.analyzeSession, sessionId),
    analyzeOverview: (data: unknown) => ipcRenderer.invoke(IPC_CHANNELS.ai.analyzeOverview, data),
  },
  settings: {
    getAutoLaunch: () => ipcRenderer.invoke(IPC_CHANNELS.settings.getAutoLaunch),
    setAutoLaunch: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.settings.setAutoLaunch, enabled),
  },
  notify: {
    show: (title: string, body: string) => ipcRenderer.invoke(IPC_CHANNELS.notify.show, title, body),
  },
  data: {
    exportSessions: (format: 'csv' | 'json') => ipcRenderer.invoke(IPC_CHANNELS.data.exportSessions, format),
  },
  updater: {
    onStatus: (cb: (info: { status: string; version?: string }) => void) => {
      const handler = (_: unknown, info: { status: string; version?: string }) => cb(info)
      ipcRenderer.on(IPC_CHANNELS.updater.status, handler)
      return () => ipcRenderer.removeListener(IPC_CHANNELS.updater.status, handler)
    },
    install: () => ipcRenderer.invoke(IPC_CHANNELS.updater.install),
  },
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
