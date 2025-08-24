export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          created_at: string
          updated_at: string
          source: 'voice' | 'text' | 'ai_generated'
          ai_context: string | null
          external_id: string | null
          external_platform: 'google_calendar' | 'notion' | 'trello' | 'slack' | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          source?: 'voice' | 'text' | 'ai_generated'
          ai_context?: string | null
          external_id?: string | null
          external_platform?: 'google_calendar' | 'notion' | 'trello' | 'slack' | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          source?: 'voice' | 'text' | 'ai_generated'
          ai_context?: string | null
          external_id?: string | null
          external_platform?: 'google_calendar' | 'notion' | 'trello' | 'slack' | null
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          platform: 'google_calendar' | 'notion' | 'trello' | 'slack'
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: 'google_calendar' | 'notion' | 'notion' | 'trello' | 'slack'
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: 'google_calendar' | 'notion' | 'trello' | 'slack'
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          input_text: string
          ai_response: string
          task_created: boolean
          task_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_text: string
          ai_response: string
          task_created?: boolean
          task_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input_text?: string
          ai_response?: string
          task_created?: boolean
          task_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Integration = Database['public']['Tables']['integrations']['Row']
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row']

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskSource = 'voice' | 'text' | 'ai_generated'
export type IntegrationPlatform = 'google_calendar' | 'notion' | 'trello' | 'slack'
