export type MemberRole =
  | "presidente"
  | "vice_presidente"
  | "secretario"
  | "tesoureiro"
  | "diretor_marketing"
  | "diretor_tecnologia"
  | "diretor_inovacao"
  | "diretor"
  | "membro"
  | "parceiro_estrategico"
  | "voluntario";

export type MemberStatus = "ativo" | "pendente" | "inativo";

export interface Member {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: MemberRole;
  status: MemberStatus;
  company: string | null;
  industry: string | null;
  city: string | null;
  linkedin: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface Event {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: "networking" | "palestra" | "workshop" | "gala" | "almoco" | "outro";
  max_attendees: number | null;
  is_public: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_id: string;
  registered_at: string;
  status: "confirmado" | "cancelado" | "lista_espera";
}

export interface MarketData {
  id: string;
  indicator: string;
  value: string;
  category: string;
  source: string | null;
  updated_at: string;
}

export interface Director {
  id: string;
  name: string;
  role: string;
  profile: string;
  linkedin: string | null;
  company: string | null;
  photo_url: string | null;
  order_index: number;
}

// Phase 4: Billing & Reports

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "incomplete" | "free";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type ReportType = "members" | "events" | "financial" | "market" | "monthly";

export interface MembershipTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  member_id: string;
  tier_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string | null;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  generated_by: string | null;
  data: Record<string, unknown>;
  file_url: string | null;
  created_at: string;
}

// Phase 3: Messaging & Notifications

export type ConversationStatus = "open" | "closed" | "archived";
export type MessageDirection = "inbound" | "outbound";
export type MessageContentType = "text" | "image" | "document" | "audio" | "video" | "location" | "system";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";
export type NotificationChannel = "whatsapp" | "email" | "both";
export type TemplateCategory = "welcome" | "event" | "reminder" | "billing" | "general" | "broadcast";
export type WahaSessionStatus = "connected" | "disconnected" | "qr_pending" | "error";

export interface Conversation {
  id: string;
  member_id: string | null;
  whatsapp_number: string;
  member_name: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  content: string;
  content_type: MessageContentType;
  whatsapp_message_id: string | null;
  sender_name: string | null;
  is_from_bot: boolean;
  metadata: Record<string, unknown>;
  status: MessageStatus;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationLog {
  id: string;
  member_id: string | null;
  channel: NotificationChannel;
  template_id: string | null;
  subject: string | null;
  content: string;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  sent_at: string | null;
  created_at: string;
}

export interface WahaSession {
  id: string;
  session_name: string;
  status: WahaSessionStatus;
  phone_number: string | null;
  qr_code: string | null;
  last_ping: string | null;
  created_at: string;
  updated_at: string;
}

export interface BotConfig {
  id: string;
  is_active: boolean;
  model: string;
  system_prompt: string;
  max_tokens: number;
  temperature: number;
  auto_reply_enabled: boolean;
  auto_reply_delay_ms: number;
  working_hours_only: boolean;
  working_hours_start: string;
  working_hours_end: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: Omit<Member, "id" | "created_at">;
        Update: Partial<Omit<Member, "id" | "created_at">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at">;
        Update: Partial<Omit<Event, "id" | "created_at">>;
        Relationships: [];
      };
      event_registrations: {
        Row: EventRegistration;
        Insert: Omit<EventRegistration, "id">;
        Update: Partial<Omit<EventRegistration, "id">>;
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_registrations_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          }
        ];
      };
      market_data: {
        Row: MarketData;
        Insert: Omit<MarketData, "id">;
        Update: Partial<Omit<MarketData, "id">>;
        Relationships: [];
      };
      directors: {
        Row: Director;
        Insert: Omit<Director, "id">;
        Update: Partial<Omit<Director, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
