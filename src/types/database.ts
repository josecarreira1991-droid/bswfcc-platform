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
