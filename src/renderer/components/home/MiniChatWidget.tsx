import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import { useNavBadgeStore } from '../../stores/navBadgeStore'
import { useFriends } from '../../hooks/useFriends'
import { useChat } from '../../hooks/useChat'
import { playClickSound, playMessageSound } from '../../lib/sounds'
import type { FriendProfile } from '../../hooks/useFriends'
import type { ChatMessage } from '../../hooks/useChat'

type WidgetState = 'collapsed' | 'list' | 'thread'

interface RecentConversation {
  friend: FriendProfile
  lastMessage: ChatMessage
  unreadCount: number
}

export function MiniChatWidget() {
  const { user } = useAuthStore()
  const { unreadMessagesCount } = useNavBadgeStore()
  const { friends, unreadByFriendId } = useFriends()
  const [widgetState, setWidgetState] = useState<WidgetState>('collapsed')
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null)
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([])
  const [loading, setLoading] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  
  const { messages, loading: chatLoading, sending, getConversation, sendMessage, markConversationRead, getRecentConversations } = useChat(selectedFriend?.id ?? null)

  // Close widget when clicking outside
  useEffect(() => {
    if (widgetState === 'collapsed') return
    
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setWidgetState('collapsed')
        setSelectedFriend(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [widgetState])

  // Fetch recent conversations when opening list
  useEffect(() => {
    if (widgetState !== 'list') return
    
    const fetchRecent = async () => {
      setLoading(true)
      
      // Get recent conversations with actual messages
      const recentChats = await getRecentConversations(3)
      
      // Match with friend profiles
      const conversationsWithFriends = recentChats
        .map(({ partnerId, message }) => {
          const friend = friends.find(f => f.id === partnerId)
          if (!friend) return null
          
          return {
            friend,
            lastMessage: message,
            unreadCount: unreadByFriendId[friend.id] || 0
          }
        })
        .filter((c): c is RecentConversation => c !== null)
      
      setRecentConversations(conversationsWithFriends)
      setLoading(false)
    }

    fetchRecent()
  }, [widgetState, friends, unreadByFriendId, getRecentConversations])

  // Fetch conversation when opening thread
  useEffect(() => {
    if (widgetState === 'thread' && selectedFriend) {
      getConversation(selectedFriend.id)
      markConversationRead(selectedFriend.id)
    }
  }, [widgetState, selectedFriend, getConversation, markConversationRead])

  // Open conversation thread
  const handleOpenThread = (friend: FriendProfile) => {
    playClickSound()
    setSelectedFriend(friend)
    setWidgetState('thread')
  }

  // Back to list
  const handleBackToList = () => {
    playClickSound()
    setSelectedFriend(null)
    setWidgetState('list')
  }

  // Toggle widget
  const handleToggleWidget = () => {
    playClickSound()
    if (widgetState === 'collapsed') {
      setWidgetState('list')
    } else {
      setWidgetState('collapsed')
      setSelectedFriend(null)
    }
  }

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!selectedFriend || !text.trim()) return
    await sendMessage(selectedFriend.id, text)
  }

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const msgDate = new Date(date)
    const diffMs = now.getTime() - msgDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (!user) return null

  return (
    <div ref={widgetRef} className="fixed bottom-20 left-4 z-40">
      {/* Circular Button */}
      <AnimatePresence>
        {widgetState === 'collapsed' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleWidget}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              unreadMessagesCount > 0
                ? 'bg-cyber-neon/20 text-cyber-neon border-2 border-cyber-neon/40 shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : 'bg-discord-card text-gray-400 border-2 border-white/10 hover:border-white/20'
            }`}
          >
            💬
            {unreadMessagesCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-discord-red text-[10px] font-bold text-white border-2 border-discord-darker"
              >
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popup Container */}
      <AnimatePresence>
        {widgetState !== 'collapsed' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-0 left-0 w-[280px] h-[380px] bg-discord-card border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              {widgetState === 'thread' && selectedFriend ? (
                <>
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-xs"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium truncate max-w-[140px]">
                      {selectedFriend.username || 'Friend'}
                    </span>
                    {selectedFriend.is_online && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm text-white font-medium">Messages</span>
                  <button
                    onClick={handleToggleWidget}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Content */}
            {widgetState === 'list' && (
              <ConversationList
                conversations={recentConversations}
                loading={loading}
                onOpenThread={handleOpenThread}
                formatRelativeTime={formatRelativeTime}
              />
            )}

            {widgetState === 'thread' && selectedFriend && (
              <MiniThread
                friend={selectedFriend}
                messages={messages}
                loading={chatLoading}
                sending={sending}
                onSendMessage={handleSendMessage}
                userId={user.id}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Conversation List Component
function ConversationList({
  conversations,
  loading,
  onOpenThread,
  formatRelativeTime
}: {
  conversations: RecentConversation[]
  loading: boolean
  onOpenThread: (friend: FriendProfile) => void
  formatRelativeTime: (date: string) => string
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-xs">Loading...</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-gray-500 text-xs text-center">No conversations yet. Add friends to start chatting!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(({ friend, lastMessage, unreadCount }) => (
        <button
          key={friend.id}
          onClick={() => onOpenThread(friend)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-neon/20 to-purple-500/20 flex items-center justify-center text-sm border border-white/10">
              {friend.username?.[0]?.toUpperCase() || '?'}
            </div>
            {friend.is_online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-discord-card" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-sm text-white font-medium truncate">
                {friend.username || 'Friend'}
              </span>
              {lastMessage && (
                <span className="text-[10px] text-gray-500 shrink-0">
                  {formatRelativeTime(lastMessage.created_at)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 truncate flex-1">
                {lastMessage ? lastMessage.body : 'Start a conversation'}
              </p>
              {unreadCount > 0 && (
                <span className="shrink-0 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-discord-red text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

// Mini Thread Component
function MiniThread({
  friend,
  messages,
  loading,
  sending,
  onSendMessage,
  userId
}: {
  friend: FriendProfile
  messages: ChatMessage[]
  loading: boolean
  sending: boolean
  onSendMessage: (text: string) => void
  userId: string
}) {
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || sending) return
    onSendMessage(input)
    setInput('')
    playClickSound()
  }

  // Show last 4 messages
  const displayMessages = messages.slice(-4)

  return (
    <>
      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2"
      >
        {loading ? (
          <p className="text-gray-500 text-xs py-4 text-center">Loading...</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-gray-500 text-xs py-4 text-center">No messages yet. Say hi!</p>
        ) : (
          displayMessages.map((m) => {
            const isMe = m.sender_id === userId
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs ${
                    isMe
                      ? 'bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/30 rounded-br-sm'
                      : 'bg-white/10 text-gray-200 border border-white/10 rounded-bl-sm'
                  }`}
                >
                  <p className="break-words">{m.body}</p>
                  <p className={`text-[9px] mt-0.5 ${isMe ? 'text-cyber-neon/70' : 'text-gray-500'}`}>
                    {new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type..."
            className="flex-1 rounded-lg bg-discord-darker border border-white/10 px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyber-neon/40"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-cyber-neon/20 text-cyber-neon border border-cyber-neon/40 hover:bg-cyber-neon/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}
