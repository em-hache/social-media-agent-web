export type Role = 'admin' | 'manager' | 'regular'

export interface User {
    id: string | null
    name: string
    alias: string
    email: string
    number: string
    roles: Role[]
    is_active: boolean
    created_at: string | null
}

export interface Recipient {
    id: string
    name: string
    phone: string
    email: string | null
    is_active: boolean
}

export interface DistributionList {
    id: string
    name: string
    description: string
    recipients: Recipient[]
    created_at: string
    updated_at: string
}

export interface DistributionListSummary {
    id: string
    name: string
    description: string
    recipient_count: number
}

export interface CraftMessageRequest {
    user_id: string
    bullet_points: string
    organization_context?: string
}

export interface CraftMessageResponse {
    crafted_message: string
    user_id: string
    bullet_points: string
    organization_context: string | null
}

export type OutboxStatus = 'pending' | 'sent' | 'failed'

export interface OutboxEntry {
    id: string
    message_body: string | null
    recipient_phone: string
    recipient_name: string | null
    status: OutboxStatus
    created_at: string
    completed_at: string | null
}

export interface WhatsAppStatus {
    connected: boolean
    phone?: string
    battery?: number
    last_seen?: string
}
