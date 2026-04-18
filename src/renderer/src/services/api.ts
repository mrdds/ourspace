import axios, { InternalAxiosRequestConfig } from 'axios'

export const AUTH_URL = 'http://localhost:8001/api'
export const BUSINESS_URL = 'http://localhost:8000/api'
export const WS_BASE_URL = 'ws://localhost:8000/ws/connect'

const authApi = axios.create({ baseURL: AUTH_URL })
const businessApi = axios.create({ baseURL: BUSINESS_URL })

// Interceptor for Auth API
authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kumba_token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Interceptor for Business API
businessApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kumba_token')
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Alias 'api' to 'businessApi' to maintain backward compatibility and avoid crashes
export const api = businessApi
export { authApi, businessApi }

export interface EmployeeProfile {
    id: number
    email: string
    first_name: string
    last_name: string
    role?: string
    is_verified: boolean
    is_activated?: boolean
    must_change_password: boolean
    user?: {
        id: number
        email: string
        first_name: string
        last_name: string
    }
    phone_number?: string
    department?: string
    job_title?: string
    hire_date?: string
    address?: string
    city?: string
    country?: string
    avatar?: string
    birth_date?: string
    contract_type?: string
}

export interface Participant {
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

export interface Conversation {
    id: string
    title: string
    type: string
    last_message?: { content: string; created_at: string } | null
    is_unread?: boolean
    target_user_id?: number
    icon?: string
    participants_details?: Participant[]
}

export interface Message {
    id: string
    sender_id: number
    sender_name: string
    content: string
    content_type: string
    created_at: string
    is_read: boolean
    is_starred?: boolean
    reactions?: { [key: string]: number[] }
    decryptedContent?: string
}

export interface Meeting {
    id: string
    title: string
    meeting_id: string
    scheduled_at: string
}

// --- Info Center ---
export const getInformations = async (): Promise<unknown[]> => {
    const response = await businessApi.get('/hr/informations')
    return response.data
}

// --- Presence ---
export const getPresenceMe = async (): Promise<unknown> => {
    const response = await businessApi.get('/presence/me')
    return response.data
}

export const clockIn = async (data: {
    latitude: number
    longitude: number
    device_id: string
}): Promise<unknown> => {
    const response = await businessApi.post('/presence/check-in', data)
    return response.data
}

export const clockOut = async (data: {
    latitude: number
    longitude: number
    device_id: string
}): Promise<unknown> => {
    const response = await businessApi.post('/presence/check-out', data)
    return response.data
}

export const submitPresenceException = async (formData: FormData): Promise<unknown> => {
    const response = await businessApi.post('/presence/exceptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

// --- HR ---
export const getMyPayslips = async (): Promise<unknown[]> => {
    const response = await businessApi.get('/hr/payslips/me')
    return response.data
}

export const getMyLeaves = async (): Promise<unknown[]> => {
    const response = await businessApi.get('/hr/leaves/me')
    return response.data
}

export const getEmployeeProfile = async (): Promise<EmployeeProfile> => {
    const response = await businessApi.get('/hr/me')
    return response.data
}

export const getAuthProfile = async (): Promise<unknown> => {
    const response = await authApi.get('/auth/me')
    return response.data
}

// --- Connect (Chat & Meetings) ---
export const getConversations = async (): Promise<Conversation[]> => {
    const response = await businessApi.get('/connect/conversations')
    return response.data
}

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await businessApi.get(`/connect/conversations/${conversationId}/messages`)
    return response.data
}

export const createMessage = async (
    conversationId: string,
    payload: {
        content: string
        content_type: string
        media_url?: string | null
        reply_to_id?: string | null
    }
): Promise<Message> => {
    const response = await businessApi.post(`/connect/conversations/${conversationId}/messages`, payload)
    return response.data
}

export const updatePublicKey = async (publicKeyBase64: string): Promise<unknown> => {
    const response = await businessApi.post('/connect/keys', { public_key: publicKeyBase64 })
    return response.data
}

export const getPublicKey = async (userId: number): Promise<{ public_key: string }> => {
    const response = await businessApi.get(`/connect/keys/${userId}`)
    return response.data
}

export const searchUsers = async (query: string): Promise<Participant[]> => {
    const response = await businessApi.get(`/connect/users/search?q=${query}`)
    return response.data
}

export const createConversation = async (payload: {
    participant_ids?: number[]
    type?: 'direct' | 'group'
    title?: string
    description?: string
}): Promise<Conversation> => {
    const response = await businessApi.post('/connect/conversations', payload)
    return response.data
}

export const uploadMedia = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await businessApi.post('/connect/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const toggleConversationAction = async (
    conversationId: string,
    action: string
): Promise<unknown> => {
    const response = await businessApi.post(`/connect/conversations/${conversationId}/toggle/${action}`)
    return response.data
}

export const reactToMessage = async (messageId: string, reaction: string): Promise<Partial<Message>> => {
    const response = await businessApi.post(`/connect/messages/${messageId}/react?reaction=${reaction}`)
    return response.data
}

export const starMessage = async (messageId: string): Promise<Partial<Message>> => {
    const response = await businessApi.post(`/connect/messages/${messageId}/star`)
    return response.data
}

export const getMeetings = async (): Promise<unknown[]> => {
    const response = await businessApi.get('/connect/meetings')
    return response.data
}

export const createMeeting = async (payload: {
    title?: string
    conversation_id?: string
    participant_ids?: number[]
    scheduled_at?: string
    is_audio_only?: boolean
}): Promise<Meeting> => {
    const response = await businessApi.post('/connect/meetings', payload)
    return response.data
}

export const joinMeeting = async (meetingId: string): Promise<unknown> => {
    const response = await businessApi.post(`/connect/meetings/${meetingId}/join`)
    return response.data
}
