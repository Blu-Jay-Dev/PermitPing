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
      contractors: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          phone: string | null
          company_name: string | null
          trade_type: "electrician" | "hvac" | "plumber" | "gc" | "other" | null
          state: string | null
          timezone: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: "trialing" | "active" | "past_due" | "cancelled" | "inactive"
          trial_ends_at: string
          created_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          phone?: string | null
          company_name?: string | null
          trade_type?: "electrician" | "hvac" | "plumber" | "gc" | "other" | null
          state?: string | null
          timezone?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: "trialing" | "active" | "past_due" | "cancelled" | "inactive"
          trial_ends_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          phone?: string | null
          company_name?: string | null
          trade_type?: "electrician" | "hvac" | "plumber" | "gc" | "other" | null
          state?: string | null
          timezone?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: "trialing" | "active" | "past_due" | "cancelled" | "inactive"
          trial_ends_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          contractor_id: string
          name: string
          address: string | null
          client_name: string | null
          notes: string | null
          is_archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          contractor_id: string
          name: string
          address?: string | null
          client_name?: string | null
          notes?: string | null
          is_archived?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          contractor_id?: string
          name?: string
          address?: string | null
          client_name?: string | null
          notes?: string | null
          is_archived?: boolean
        }
      }
      permits: {
        Row: {
          id: string
          job_id: string
          contractor_id: string
          permit_number: string
          trade_type: "electrical" | "hvac" | "plumbing" | "building" | "other"
          issued_date: string
          expiration_date: string
          rough_in_required: boolean
          rough_in_due_date: string | null
          rough_in_called_at: string | null
          rough_in_passed_at: string | null
          final_called_at: string | null
          final_passed_at: string | null
          status: "open" | "rough_pending" | "rough_passed" | "final_pending" | "closed" | "expired"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          contractor_id: string
          permit_number: string
          trade_type: "electrical" | "hvac" | "plumbing" | "building" | "other"
          issued_date: string
          expiration_date: string
          rough_in_required?: boolean
          rough_in_due_date?: string | null
          rough_in_called_at?: string | null
          rough_in_passed_at?: string | null
          final_called_at?: string | null
          final_passed_at?: string | null
          status?: "open" | "rough_pending" | "rough_passed" | "final_pending" | "closed" | "expired"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          contractor_id?: string
          permit_number?: string
          trade_type?: "electrical" | "hvac" | "plumbing" | "building" | "other"
          issued_date?: string
          expiration_date?: string
          rough_in_required?: boolean
          rough_in_due_date?: string | null
          rough_in_called_at?: string | null
          rough_in_passed_at?: string | null
          final_called_at?: string | null
          final_passed_at?: string | null
          status?: "open" | "rough_pending" | "rough_passed" | "final_pending" | "closed" | "expired"
          notes?: string | null
        }
      }
      reminders: {
        Row: {
          id: string
          permit_id: string
          contractor_id: string
          type: "rough_in_due" | "rough_in_overdue" | "expiration_30day" | "expiration_7day" | "expiration_1day" | "final_overdue"
          channel: "email" | "sms"
          scheduled_for: string
          sent_at: string | null
          acknowledged_at: string | null
          action_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          permit_id: string
          contractor_id: string
          type: "rough_in_due" | "rough_in_overdue" | "expiration_30day" | "expiration_7day" | "expiration_1day" | "final_overdue"
          channel: "email" | "sms"
          scheduled_for: string
          sent_at?: string | null
          acknowledged_at?: string | null
          action_token?: string | null
          created_at?: string
        }
        Update: {
          sent_at?: string | null
          acknowledged_at?: string | null
          action_token?: string | null
        }
      }
      action_tokens: {
        Row: {
          id: string
          token: string
          permit_id: string
          contractor_id: string
          action: "mark_rough_called" | "mark_rough_passed" | "mark_final_called" | "mark_final_passed"
          used_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token?: string
          permit_id: string
          contractor_id: string
          action: "mark_rough_called" | "mark_rough_passed" | "mark_final_called" | "mark_final_passed"
          used_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          used_at?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Contractor = Database["public"]["Tables"]["contractors"]["Row"]
export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type Permit = Database["public"]["Tables"]["permits"]["Row"]
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"]
export type ActionToken = Database["public"]["Tables"]["action_tokens"]["Row"]

export type PermitStatus = Permit["status"]
export type TradeType = Permit["trade_type"]
export type ContractorTradeType = Contractor["trade_type"]
