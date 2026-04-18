import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import {
  ArrowLeft,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  RefreshCw,
  User as UserIcon,
  Shield,
  Check,
  CheckCheck,
  Info,
  MessageCircle,
  X,
  LayoutGrid
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import MessageInfoPanel from '../components/MessageInfoPanel'
import {
  getConversations,
  getMessages,
  createMessage,
  updatePublicKey,
  getPublicKey,
  BUSINESS_URL,
  WS_BASE_URL,
  searchUsers,
  createConversation,
  createMeeting,
  uploadMedia,
  reactToMessage,
  starMessage
} from '../services/api'
import { useAuthStore } from '../store/authStore'
import {
  getStoredKeys,
  generateKeyPair,
  storeKeyPair,
  decryptMessage,
  encryptMessage,
  purgeStoredKeys
} from '../utils/crypto'

interface Message {
  id: string
  sender_id: number
  sender_name?: string
  sender_avatar?: string
  content: string
  content_type: string
  created_at: string
  decryptedContent?: string
  is_read?: boolean
  reactions?: { [key: string]: number[] }
  is_starred?: boolean
}

interface Participant {
  id: number
  email: string
  first_name: string
  last_name: string
  public_key?: string
  avatar?: string
  phone_number?: string
  department?: string
  job_title?: string
  last_seen?: string
}

interface Conversation {
  id: string
  title: string
  type: string
  last_message?: { content: string; created_at: string } | null
  is_unread?: boolean
  target_user_id?: number
  participants_details?: Participant[]
  icon?: string
  description?: string
}

export default function ChatScreen(): React.JSX.Element {
  const { user, token } = useAuthStore()
  const [conversations, setConversations] = useState < Conversation[] > ([])
  const [activeConversation, setActiveConversation] = useState < Conversation | null > (null)
  const [messages, setMessages] = useState < Message[] > ([])
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [myKeys, setMyKeys] = useState < { publicKey: string | null; secretKey: string | null } > ({
    publicKey: null,
    secretKey: null
  })
  const [targetPublicKey, setTargetPublicKey] = useState < string | null > (null)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showMsgInfoPanel, setShowMsgInfoPanel] = useState(false)
  const [selectedMessageInfo, setSelectedMessageInfo] = useState < Message | null > (null)
  const [otherIsTyping, setOtherIsTyping] = useState < boolean > (false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState < Participant[] > ([])
  const [searching, setSearching] = useState(false)
  const typingTimeoutRef = useRef < NodeJS.Timeout | null > (null)
  const lastTypingSentRef = useRef < number > (0)
  const ws = useRef < WebSocket | null > (null)
  const messagesEndRef = useRef < HTMLDivElement > (null)
  const fileInputRef = useRef < HTMLInputElement > (null)

  const getFullAvatarUrl = (path?: string): string | null => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const baseUrl = BUSINESS_URL.replace('/api', '')
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }

  const otherParticipant = useMemo(() => {
    if (activeConversation?.type === 'direct' && activeConversation.target_user_id) {
      return activeConversation.participants_details?.find(
        (p) => p.id === activeConversation.target_user_id
      )
    }
    return null
  }, [activeConversation])

  useEffect(() => {
    if (myKeys.publicKey && myKeys.secretKey) {
      try {
        const testStr = 'TweetNaCl Self-Test'
        const encrypted = encryptMessage(testStr, myKeys.publicKey, myKeys.secretKey)
        const decrypted = decryptMessage(encrypted, myKeys.publicKey, myKeys.secretKey)
        console.log('--- Crypto Environment Self-Test ---')
        console.log('PublicKey:', myKeys.publicKey.substring(0, 10) + '...')
        console.log('Success:', decrypted === testStr ? 'YES' : 'NO')
        console.log('Result:', decrypted)
        console.log('------------------------------------')
      } catch (e) {
        console.error('Crypto Self-Test EXCEPTION:', e)
      }
    }
  }, [myKeys])

  useEffect(() => {
    console.log('--- Chat Identity Context ---')
    console.log('Auth User ID:', user?.id, `(${typeof user?.id})`)
    console.log('Auth User Email:', user?.email)
    console.log(
      'Storage Public Key:',
      localStorage.getItem('e2ee_public_key')?.substring(0, 10) + '...'
    )
    console.log('----------------------------')
  }, [user])

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchRooms = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getConversations()
      const conversationsData = data as Conversation[]
      setConversations(conversationsData)
      if (conversationsData.length > 0 && !activeConversation) {
        setActiveConversation(conversationsData[0])
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err)
    } finally {
      setLoading(false)
    }
  }, [activeConversation])

  useEffect(() => {
    const loadCryptoKeys = async (): Promise<void> => {
      let keys = getStoredKeys()
      if (!keys.publicKey || !keys.secretKey) {
        const newKeys = generateKeyPair()
        storeKeyPair(newKeys.secretKeyBase64, newKeys.publicKeyBase64)
        keys = { publicKey: newKeys.publicKeyBase64, secretKey: newKeys.secretKeyBase64 }
        try {
          await updatePublicKey(newKeys.publicKeyBase64)
        } catch (err) {
          console.error('Failed to register public key', err)
        }
      }

      setMyKeys((prev) => {
        if (prev.publicKey === keys.publicKey && prev.secretKey === keys.secretKey) return prev
        return { publicKey: keys.publicKey, secretKey: keys.secretKey }
      })
    }

    if (user?.id) {
      loadCryptoKeys()
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchRooms()
    }
  }, [user?.id, fetchRooms])

  useEffect(() => {
    if (!activeConversation) return

    const fetchChatMessages = async (): Promise<void> => {
      setMessagesLoading(true)
      try {
        if (activeConversation.type === 'direct' && activeConversation.target_user_id) {
          try {
            const keyData = await getPublicKey(activeConversation.target_user_id)
            const key = keyData?.public_key || null
            console.log('Fetched target public key:', key ? key.substring(0, 10) + '...' : 'NONE')
            setTargetPublicKey(key)
          } catch (err) {
            console.error('Failed to fetch target public key', err)
            setTargetPublicKey(null)
          }
        } else {
          setTargetPublicKey(null)
        }

        const data = await getMessages(activeConversation.id)
        setMessages(data as Message[])
        setTimeout(scrollToBottom, 100)
      } catch (err) {
        console.error('Failed to fetch messages', err)
      } finally {
        setMessagesLoading(false)
      }
    }

    fetchChatMessages()

    if (ws.current) ws.current.close()
    ws.current = new WebSocket(`${WS_BASE_URL}/${activeConversation.id}/?token=${token}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'chat_message') {
        const newMsg: Message = {
          id: data.id || Math.random().toString(),
          sender_id: data.user_id,
          sender_name: data.sender_name,
          content: data.message,
          content_type: data.content_type,
          created_at: data.timestamp || new Date().toISOString(),
          is_read: false
        }
        setMessages((prev) => [...prev, newMsg])
        setOtherIsTyping(false)
        setTimeout(scrollToBottom, 50)
      } else if (data.type === 'typing') {
        if (data.user_id !== user?.id) {
          setOtherIsTyping(data.is_typing)
          if (data.is_typing) setTimeout(scrollToBottom, 50)
        }
      }
    }

    return () => ws.current?.close()
  }, [activeConversation, token, user?.id])

  const handleSearch = async (val: string): Promise<void> => {
    setSearchQuery(val)
    if (!val.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const results = await searchUsers(val)
      setSearchResults(results)
    } catch (err) {
      console.error('Search failed', err)
    } finally {
      setSearching(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file || !activeConversation) return

    try {
      setLoading(true)
      const data = await uploadMedia(file)
      const payload = {
        content: data.url,
        content_type: file.type.startsWith('image/') ? 'image' : 'file'
      }
      await createMessage(activeConversation.id, payload)
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = async (targetUser: Participant): Promise<void> => {
    try {
      const conv = await createConversation({
        participant_ids: [targetUser.id],
        type: 'direct'
      })

      setConversations((prev) => {
        if (prev.find((c) => c.id === conv.id)) return prev
        return [conv, ...prev]
      })

      setActiveConversation(conv)
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      console.error('Failed to start conversation', err)
    }
  }

  const decryptedMessages = useMemo(() => {
    return messages.map((msg) => {
      const isEncryptedPayload =
        typeof msg.content === 'string' && msg.content.trim().startsWith('{"nonce":')

      if (!isEncryptedPayload || msg.decryptedContent) return msg

      try {
        const isMe = Number(msg.sender_id) === Number(user?.id)
        const otherParticipantId = isMe ? Number(activeConversation?.target_user_id) : Number(msg.sender_id)

        let otherPubKey = activeConversation?.participants_details?.find(
          (p) => Number(p.id) === otherParticipantId
        )?.public_key

        if (!otherPubKey && otherParticipantId === Number(activeConversation?.target_user_id)) {
          otherPubKey = targetPublicKey || undefined
        }

        if (otherPubKey && myKeys.secretKey) {
          const decrypted = decryptMessage(msg.content, otherPubKey, myKeys.secretKey)

          if (decrypted && decrypted !== msg.content) {
            return { ...msg, decryptedContent: decrypted }
          }
        }
      } catch (e) {
        console.error('Decryption logic error:', e)
      }
      return msg
    })
  }, [messages, activeConversation, myKeys, targetPublicKey, user?.id])

  const handleResetKeys = async (): Promise<void> => {
    if (!window.confirm('Voulez-vous vraiment réinitialiser vos clés de sécurité ? Vos anciens messages pourraient devenir illisibles.')) return

    try {
      setLoading(true)
      const newKeys = generateKeyPair()
      storeKeyPair(newKeys.secretKeyBase64, newKeys.publicKeyBase64)
      await updatePublicKey(newKeys.publicKeyBase64)
      setMyKeys({ publicKey: newKeys.publicKeyBase64, secretKey: newKeys.secretKeyBase64 })
      alert('Clés réinitialisées avec succès. Les nouveaux messages utiliseront ces clés.')
      fetchRooms()
    } catch (err) {
      console.error('Failed to reset keys', err)
      alert('Erreur lors de la réinitialisation des clés.')
    } finally {
      setLoading(false)
    }
  }

  const handlePurgeKeys = (): void => {
    if (window.confirm('Voulez-vous vider toute la session de sécurité ? Cela supprimera vos clés locales et vous devrez en générer de nouvelles.')) {
      purgeStoredKeys()
      setMyKeys({ publicKey: null, secretKey: null })
      alert('Session de sécurité vidée. Veuillez régénérer vos clés.')
    }
  }

  const handleSendMessage = async (): Promise<void> => {
    if (!messageInput.trim() || !activeConversation) return

    let finalContent = messageInput
    let contentType = 'text'

    if (targetPublicKey && myKeys.secretKey) {
      finalContent = encryptMessage(messageInput, targetPublicKey, myKeys.secretKey)
      contentType = 'encrypted_text'
    }

    const payload = {
      content: finalContent,
      content_type: contentType
    }

    try {
      await createMessage(activeConversation.id, payload)
      setMessageInput('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  const handleToggleStar = async (messageId: string): Promise<void> => {
    try {
      const updatedMsg = await starMessage(messageId)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updatedMsg } : m)))
    } catch (err) {
      console.error('Failed to star message', err)
    }
  }

  const handleAddReaction = async (messageId: string, emoji: string): Promise<void> => {
    try {
      const updatedMsg = await reactToMessage(messageId, emoji)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, ...updatedMsg } : m)))
    } catch (err) {
      console.error('Failed to react to message', err)
    }
  }

  const handleCreateMeeting = async (type: 'audio' | 'video'): Promise<void> => {
    if (!activeConversation) return
    try {
      const meeting = await createMeeting({
        conversation_id: activeConversation.id,
        is_audio_only: type === 'audio'
      })
      console.log('Meeting created:', meeting)
      await createMessage(activeConversation.id, {
        content: `Réunion ${type === 'video' ? 'vidéo' : 'audio'} démarrée: ${meeting.meeting_id}`,
        content_type: 'meeting_link'
      })
    } catch (err) {
      console.error('Failed to create meeting', err)
    }
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-white overflow-hidden">
      <header className="h-20 px-8 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <ArrowLeft size={18} />
          </NavLink>
          <div>
            <h1 className="text-xl font-extrabold text-[#1E293B]">Messages</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Communication Interne
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-slate-100 flex flex-col shrink-0 flex-grow-0 bg-[#FBFDFF]">
          <div className="p-6">
            <div className="relative group mb-6">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Rechercher un collègue..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary/20 pl-10 pr-4 py-3 rounded-2xl w-full outline-none transition-all text-xs font-bold"
              />

              {(searchResults.length > 0 || searching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-2">
                  {searching ? (
                    <div className="p-4 text-center text-[10px] font-black uppercase text-slate-400">Recherche...</div>
                  ) : (
                    searchResults.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black overflow-hidden">
                          {u.avatar ? (
                            <img src={getFullAvatarUrl(u.avatar) || ''} className="w-full h-full object-cover" alt="" />
                          ) : (
                            u.first_name?.[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-[#1E293B] truncate">{u.first_name} {u.last_name}</p>
                          <p className="text-[9px] font-bold text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-10 flex flex-col items-center gap-2 opacity-20">
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-[10px] font-black uppercase">Chargement...</span>
                </div>
              ) : (
                conversations.map((conv) => {
                  const lastMsgTime = conv.last_message
                    ? new Date(conv.last_message.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : ''
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`p-4 rounded-2xl flex gap-3 cursor-pointer transition-all border ${activeConversation?.id === conv.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white hover:bg-slate-50 border-slate-50 shadow-sm'}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl relative shrink-0 flex items-center justify-center overflow-hidden ${activeConversation?.id === conv.id ? 'bg-white/20' : 'bg-slate-100'}`}
                      >
                        {conv.icon ? (
                          <img
                            src={getFullAvatarUrl(conv.icon) || ''}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon
                            size={20}
                            className={activeConversation?.id === conv.id ? 'text-white' : 'text-slate-400'}
                          />
                        )}
                        {conv.participants_details?.some(
                          (p) =>
                            p.id === conv.target_user_id &&
                            p.last_seen &&
                            Date.now() - new Date(p.last_seen).getTime() < 300000
                        ) && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4
                            className={`text-xs font-black truncate ${activeConversation?.id === conv.id ? 'text-white' : 'text-[#1E293B]'}`}
                          >
                            {conv.title || 'Inconnu'}
                          </h4>
                          <span
                            className={`text-[9px] font-bold ${activeConversation?.id === conv.id ? 'text-white/60' : 'text-slate-400'}`}
                          >
                            {lastMsgTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p
                            className={`text-[11px] truncate font-medium ${activeConversation?.id === conv.id ? 'text-white/80' : 'text-slate-500'}`}
                          >
                            {conv.last_message?.content || 'Aucun message'}
                          </p>
                          {conv.is_unread && (
                            <div className="w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shrink-0">
                              !
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-slate-50/30 relative">
          {activeConversation ? (
            <>
              <div className="px-8 py-5 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowInfoPanel(true)}
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                    {activeConversation.icon ? (
                      <img
                        src={getFullAvatarUrl(activeConversation.icon) || ''}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E293B] group-hover:text-primary transition-colors">
                      {activeConversation.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {otherParticipant?.last_seen && Date.now() - new Date(otherParticipant.last_seen).getTime() < 300000 ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">
                            En ligne
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {otherParticipant?.last_seen
                              ? `Vu ${new Date(otherParticipant.last_seen).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}`
                              : 'Hors ligne'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateMeeting('audio')}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all bg-white border border-slate-100 shadow-sm"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={() => handleCreateMeeting('video')}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all bg-white border border-slate-100 shadow-sm"
                  >
                    <Video size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setShowInfoPanel(!showInfoPanel)
                      setShowMsgInfoPanel(false)
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm ${showInfoPanel ? 'bg-primary text-white border-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-primary bg-white border-slate-100'}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="flex h-full overflow-hidden">
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-y-4">
                    {messagesLoading && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                        <RefreshCw className="text-primary animate-spin" size={32} />
                      </div>
                    )}

                    {decryptedMessages.map((msg) => {
                      const isMe = Number(msg.sender_id) === Number(user?.id)
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-4 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black overflow-hidden ${isMe ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-500'}`}
                          >
                            {msg.sender_avatar ? (
                              <img
                                src={getFullAvatarUrl(msg.sender_avatar) || ''}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              msg.sender_name?.substring(0, 1) || '?'
                            )}
                          </div>
                          <div
                            onContextMenu={(e) => {
                              e.preventDefault()
                              setSelectedMessageInfo(msg)
                              setShowMsgInfoPanel(true)
                              setShowInfoPanel(false)
                            }}
                            className={`p-4 rounded-2xl cursor-default relative group/msg ${isMe ? 'bg-primary text-white shadow-lg shadow-primary/10 rounded-tr-none' : 'bg-white border border-slate-100 shadow-sm rounded-tl-none'}`}
                          >
                            <button
                              onClick={() => {
                                setSelectedMessageInfo(msg)
                                setShowMsgInfoPanel(true)
                                setShowInfoPanel(false)
                              }}
                              className={`absolute -top-2 ${isMe ? '-left-8' : '-right-8'} p-1.5 bg-white rounded-lg shadow-md border border-slate-100 text-slate-400 hover:text-primary opacity-0 group-hover/msg:opacity-100 transition-all scale-75 group-hover/msg:scale-100`}
                              title="Infos du message"
                            >
                              <Info size={12} />
                            </button>
                            {!isMe && (
                              <p className="text-[10px] font-black text-primary mb-1 uppercase tracking-tighter">
                                {msg.sender_name}
                              </p>
                            )}
                            <p className="text-[13px] font-medium leading-relaxed">
                              {msg.decryptedContent || msg.content}
                            </p>

                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                  <div
                                    key={emoji}
                                    onClick={() => handleAddReaction(msg.id, emoji)}
                                    className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 border cursor-pointer hover:bg-slate-50 transition-colors ${users.includes(user?.id || 0) ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-slate-100 text-slate-400'}`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{users.length}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-4 mt-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9px] font-bold block uppercase whitespace-nowrap ${isMe ? 'text-white/50' : 'text-slate-300'}`}
                                >
                                  {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {msg.is_starred && (
                                  <div className={isMe ? 'text-white/70' : 'text-yellow-500'}>
                                    <Shield size={8} fill="currentColor" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleAddReaction(msg.id, '❤️')}
                                  className={`text-[10px] p-1 rounded hover:bg-black/5 ${isMe ? 'hover:bg-white/10' : ''}`}
                                >
                                  ❤️
                                </button>
                                <button
                                  onClick={() => handleToggleStar(msg.id)}
                                  className={`p-1 rounded hover:bg-black/5 ${isMe ? 'hover:bg-white/10' : ''}`}
                                >
                                  <Shield size={10} className={msg.is_starred ? 'fill-current' : ''} />
                                </button>
                              </div>
                              {isMe && (
                                <div className="flex items-center">
                                  {msg.is_read ? (
                                    <CheckCheck size={12} className="text-white/70" />
                                  ) : (
                                    <Check size={12} className="text-white/40" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {otherIsTyping && (
                      <div className="flex items-center gap-3 animate-pulse px-2 py-1">
                        <div className="flex gap-1.5 items-center">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-0"></span>
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-300"></span>
                        </div>
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest italic">
                          {activeConversation.title} est en train d&apos;écrire...
                        </span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-6 bg-white border-t border-slate-100">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendMessage()
                      }}
                      className="bg-slate-50 rounded-2xl p-2 flex items-center gap-2 border border-slate-100 focus-within:border-primary/20 focus-within:bg-white transition-all shadow-inner"
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                      >
                        <Paperclip size={20} />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleMediaUpload} />
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value)

                          if (ws.current?.readyState === WebSocket.OPEN) {
                            const now = Date.now()
                            if (now - lastTypingSentRef.current > 3000) {
                              ws.current.send(JSON.stringify({ type: 'typing', is_typing: true }))
                              lastTypingSentRef.current = now
                            }

                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                            typingTimeoutRef.current = setTimeout(() => {
                              ws.current?.send(JSON.stringify({ type: 'typing', is_typing: false }))
                            }, 5000)
                          }
                        }}
                        placeholder="Écrivez votre message..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold px-2"
                      />
                      <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                      >
                        <Smile size={20} />
                      </button>
                      <button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>

                  {showInfoPanel && (
                    <ChatInfoPanel
                      isOpen={showInfoPanel}
                      onClose={() => setShowInfoPanel(false)}
                      conversation={activeConversation}
                      otherParticipant={otherParticipant}
                      publicKey={targetPublicKey}
                      getFullAvatarUrl={getFullAvatarUrl}
                      onResetKeys={handleResetKeys}
                      onPurgeKeys={handlePurgeKeys}
                    />
                  )}
                  {showMsgInfoPanel && (
                    <MessageInfoPanel
                      isOpen={showMsgInfoPanel}
                      onClose={() => setShowMsgInfoPanel(false)}
                      message={selectedMessageInfo}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-white">
              <MessageCircle size={64} className="mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-sm text-slate-400">
                Sélectionnez une conversation
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ChatInfoPanel({
  isOpen,
  onClose,
  conversation,
  otherParticipant,
  publicKey,
  getFullAvatarUrl,
  onResetKeys,
  onPurgeKeys
}: {
  isOpen: boolean
  onClose: () => void
  conversation: Conversation
  otherParticipant: Participant | null | undefined
  publicKey: string | null
  getFullAvatarUrl: (p?: string) => string | null
  onResetKeys: () => void
  onPurgeKeys: () => void
}): React.JSX.Element | null {
  if (!isOpen) return null

  return (
    <aside className="w-80 border-l border-slate-100 flex flex-col shrink-0 bg-white animate-in slide-in-from-right duration-300 h-full">
      <div className="h-20 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        <h3 className="font-extrabold text-[#1E293B]">Infos</h3>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden mb-4 border-2 border-primary/5 shadow-sm">
            {conversation.icon ? (
              <img src={getFullAvatarUrl(conversation.icon) || ''} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl font-black text-primary">{conversation.title.substring(0, 1)}</div>
            )}
          </div>
          <h2 className="text-sm font-black text-[#1E293B] mb-1">{conversation.title}</h2>
          <p className="text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed px-4">
            Ramadan working hours 08:30~14:00 UTC +2 Text me on WhatsApp ...
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-3 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-blue-600 group hover:bg-blue-50 transition-colors">
            <MessageCircle size={18} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Chats</span>
          </button>
          <button className="flex-1 py-3 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-blue-600 group hover:bg-blue-50 transition-colors">
            <Phone size={18} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Call</span>
          </button>
          <button className="flex-1 py-3 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 text-blue-600 group hover:bg-blue-50 transition-colors">
            <LayoutGrid size={18} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Multi-media</span>
          </button>
        </div>

        <div className="space-y-5 px-1">
          <div className="grid grid-cols-[85px,1fr] gap-x-2 items-baseline">
            <span className="text-[11px] font-bold text-slate-400">Name</span>
            <span className="text-[12px] font-black text-[#1E293B] break-words">{conversation.title}</span>
          </div>

          <div className="grid grid-cols-[85px,1fr] gap-x-2 items-baseline">
            <span className="text-[11px] font-bold text-slate-400">Account</span>
            <span className="text-[12px] font-bold text-slate-600">
              {otherParticipant?.id ? `acc_${otherParticipant.id}` : 'n/a'}
            </span>
          </div>

          <div className="grid grid-cols-[85px,1fr] gap-x-2 items-baseline">
            <span className="text-[11px] font-bold text-slate-400">Mobile</span>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-700 leading-none">
                {otherParticipant?.phone_number || 'N/A'}{' '}
                {otherParticipant?.phone_number && (
                  <span className="text-[10px] font-medium text-slate-400 tracking-tight">(Numéro direct)</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[85px,1fr] gap-x-2 items-baseline">
            <span className="text-[11px] font-bold text-slate-400">Email</span>
            <span className="text-[12px] font-bold text-blue-600 break-all underline decoration-blue-200 underline-offset-2 cursor-pointer hover:text-blue-700">
              {otherParticipant?.email || 'n/a'}
            </span>
          </div>

          <div className="grid grid-cols-[85px,1fr] gap-x-2 items-baseline">
            <span className="text-[11px] font-bold text-slate-400">Dépt.</span>
            <span className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
              {otherParticipant?.department || otherParticipant?.job_title || 'Service non spécifié'}
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} className="text-green-500" /> Sécurité E2EE
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-primary font-bold truncate max-w-[150px]">
                {publicKey || 'Non générée'}
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={onResetKeys}
                className="py-2 px-3 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
              >
                Réinitialiser les clés
              </button>
              <button
                onClick={onPurgeKeys}
                className="py-2 px-3 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                Vider la session
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
