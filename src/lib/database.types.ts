export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'patient' | 'professional'
          phone: string | null
          specialty: string | null
          license_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'patient' | 'professional'
          phone?: string | null
          specialty?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'patient' | 'professional'
          phone?: string | null
          specialty?: string | null
          license_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          professional_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          appointment_date: string
          start_time: string
          end_time: string
          type: 'presencial' | 'virtual'
          status: 'confirmada' | 'cancelada' | 'completada' | 'no-show'
          notes: string | null
          room_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          appointment_date: string
          start_time: string
          end_time: string
          type: 'presencial' | 'virtual'
          status?: 'confirmada' | 'cancelada' | 'completada' | 'no-show'
          notes?: string | null
          room_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          type?: 'presencial' | 'virtual'
          status?: 'confirmada' | 'cancelada' | 'completada' | 'no-show'
          notes?: string | null
          room_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          appointment_id: string | null
          record_date: string
          diagnosis: string | null
          treatment: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          appointment_id?: string | null
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          appointment_id?: string | null
          record_date?: string
          diagnosis?: string | null
          treatment?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reminder' | 'cancellation' | 'confirmation' | 'system'
          title: string
          message: string
          read: boolean
          related_appointment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reminder' | 'cancellation' | 'confirmation' | 'system'
          title: string
          message: string
          read?: boolean
          related_appointment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reminder' | 'cancellation' | 'confirmation' | 'system'
          title?: string
          message?: string
          read?: boolean
          related_appointment_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
