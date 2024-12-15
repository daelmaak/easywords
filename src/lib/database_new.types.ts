export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      vocabularies: {
        Row: {
          archived: boolean | null
          country: string
          created_at: string
          id: number
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          country: string
          created_at?: string
          id?: number
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          country?: string
          created_at?: string
          id?: number
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vocabulary_test_result_words: {
        Row: {
          attempts: number[] | null
          created_at: string
          done: boolean
          result: number
          results_id: number
          word_id: number
        }
        Insert: {
          attempts?: number[] | null
          created_at?: string
          done: boolean
          result: number
          results_id: number
          word_id: number
        }
        Update: {
          attempts?: number[] | null
          created_at?: string
          done?: boolean
          result?: number
          results_id?: number
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_test_result_words_results_id_fkey"
            columns: ["results_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_test_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocabulary_test_result_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_test_results: {
        Row: {
          created_at: string
          done: boolean
          id: number
          updated_at: string
          vocabulary_id: number
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: number
          updated_at?: string
          vocabulary_id: number
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: number
          updated_at?: string
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_test_results_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_tester_settings: {
        Row: {
          created_at: string
          id: number
          repeat_incorrect_words: boolean
          reverse_words: boolean
          user_id: string
          write_words: boolean
        }
        Insert: {
          created_at?: string
          id?: number
          repeat_incorrect_words?: boolean
          reverse_words?: boolean
          user_id: string
          write_words?: boolean
        }
        Update: {
          created_at?: string
          id?: number
          repeat_incorrect_words?: boolean
          reverse_words?: boolean
          user_id?: string
          write_words?: boolean
        }
        Relationships: []
      }
      words: {
        Row: {
          archived: boolean | null
          created_at: string
          id: number
          notes: string | null
          original: string
          translation: string
          vocabulary_id: number
        }
        Insert: {
          archived?: boolean | null
          created_at?: string
          id?: number
          notes?: string | null
          original: string
          translation: string
          vocabulary_id: number
        }
        Update: {
          archived?: boolean | null
          created_at?: string
          id?: number
          notes?: string | null
          original?: string
          translation?: string
          vocabulary_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_vocabulary_items_list_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabularies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_previous_word_results: {
        Args: {
          base_test_result_id: number
        }
        Returns: {
          word_id: number
          result: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
