export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alert_history: {
        Row: {
          acknowledged: boolean | null
          alert_level: string
          created_at: string | null
          engine_id: string
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          alert_level: string
          created_at?: string | null
          engine_id: string
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          alert_level?: string
          created_at?: string | null
          engine_id?: string
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cusip_anomalies: {
        Row: {
          anomaly_details: Json | null
          anomaly_type: string
          confidence_level: number
          cusip_id: string
          detected_at: string
          detection_method: string
          id: string
          is_validated: boolean | null
          raw_features: Json | null
          severity_score: number
          validation_notes: string | null
        }
        Insert: {
          anomaly_details?: Json | null
          anomaly_type: string
          confidence_level: number
          cusip_id: string
          detected_at?: string
          detection_method: string
          id?: string
          is_validated?: boolean | null
          raw_features?: Json | null
          severity_score: number
          validation_notes?: string | null
        }
        Update: {
          anomaly_details?: Json | null
          anomaly_type?: string
          confidence_level?: number
          cusip_id?: string
          detected_at?: string
          detection_method?: string
          id?: string
          is_validated?: boolean | null
          raw_features?: Json | null
          severity_score?: number
          validation_notes?: string | null
        }
        Relationships: []
      }
      cusip_metadata: {
        Row: {
          benchmark_security: boolean | null
          convexity: number | null
          created_at: string
          cusip_id: string
          duration: number | null
          id: string
          issuer: string | null
          liquidity_tier: number | null
          maturity_bucket: string | null
          on_the_run: boolean | null
          security_type: string
          updated_at: string
        }
        Insert: {
          benchmark_security?: boolean | null
          convexity?: number | null
          created_at?: string
          cusip_id: string
          duration?: number | null
          id?: string
          issuer?: string | null
          liquidity_tier?: number | null
          maturity_bucket?: string | null
          on_the_run?: boolean | null
          security_type: string
          updated_at?: string
        }
        Update: {
          benchmark_security?: boolean | null
          convexity?: number | null
          created_at?: string
          cusip_id?: string
          duration?: number | null
          id?: string
          issuer?: string | null
          liquidity_tier?: number | null
          maturity_bucket?: string | null
          on_the_run?: boolean | null
          security_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          content: Json
          created_at: string
          id: string
          report_date: string
          report_id: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          report_date: string
          report_id: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          report_date?: string
          report_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_points: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          indicator_id: string
          raw_data: Json | null
          source_hash: string | null
          timestamp: string
          value: number
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          indicator_id: string
          raw_data?: Json | null
          source_hash?: string | null
          timestamp: string
          value: number
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          indicator_id?: string
          raw_data?: Json | null
          source_hash?: string | null
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "data_points_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      data_validations: {
        Row: {
          data_point_id: string
          id: string
          is_consensus: boolean | null
          metadata: Json | null
          validation_source: string
          validation_timestamp: string
          validation_value: number
          variance_pct: number | null
        }
        Insert: {
          data_point_id: string
          id?: string
          is_consensus?: boolean | null
          metadata?: Json | null
          validation_source: string
          validation_timestamp?: string
          validation_value: number
          variance_pct?: number | null
        }
        Update: {
          data_point_id?: string
          id?: string
          is_consensus?: boolean | null
          metadata?: Json | null
          validation_source?: string
          validation_timestamp?: string
          validation_value?: number
          variance_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_validations_data_point_id_fkey"
            columns: ["data_point_id"]
            isOneToOne: false
            referencedRelation: "data_points"
            referencedColumns: ["id"]
          },
        ]
      }
      engine_execution_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_quality_score: number | null
          engine_id: string
          error_message: string | null
          execution_time_ms: number | null
          fallback_used: boolean | null
          id: string
          success: boolean
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_quality_score?: number | null
          engine_id: string
          error_message?: string | null
          execution_time_ms?: number | null
          fallback_used?: boolean | null
          id?: string
          success: boolean
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_quality_score?: number | null
          engine_id?: string
          error_message?: string | null
          execution_time_ms?: number | null
          fallback_used?: boolean | null
          id?: string
          success?: boolean
        }
        Relationships: []
      }
      engine_executions: {
        Row: {
          confidence: number | null
          created_at: string
          engine_id: string
          error_message: string | null
          execution_time_ms: number
          id: string
          result_data: Json | null
          signal: string | null
          success: boolean
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          engine_id: string
          error_message?: string | null
          execution_time_ms: number
          id?: string
          result_data?: Json | null
          signal?: string | null
          success?: boolean
        }
        Update: {
          confidence?: number | null
          created_at?: string
          engine_id?: string
          error_message?: string | null
          execution_time_ms?: number
          id?: string
          result_data?: Json | null
          signal?: string | null
          success?: boolean
        }
        Relationships: []
      }
      engine_outputs: {
        Row: {
          alerts: Json | null
          analysis: string | null
          calculated_at: string
          confidence: number
          created_at: string | null
          engine_id: string
          id: string
          importance_score: number | null
          pillar: number
          primary_value: number
          signal: string
          sub_metrics: Json | null
        }
        Insert: {
          alerts?: Json | null
          analysis?: string | null
          calculated_at?: string
          confidence: number
          created_at?: string | null
          engine_id: string
          id?: string
          importance_score?: number | null
          pillar: number
          primary_value: number
          signal: string
          sub_metrics?: Json | null
        }
        Update: {
          alerts?: Json | null
          analysis?: string | null
          calculated_at?: string
          confidence?: number
          created_at?: string | null
          engine_id?: string
          id?: string
          importance_score?: number | null
          pillar?: number
          primary_value?: number
          signal?: string
          sub_metrics?: Json | null
        }
        Relationships: []
      }
      h41_validation: {
        Row: {
          central_bank_liquidity_swaps: number | null
          created_at: string
          id: string
          other_assets: number | null
          reconciliation_status: string | null
          report_date: string
          repurchase_agreements: number | null
          securities_held_outright: number | null
          total_assets: number | null
          variance_from_soma: number | null
        }
        Insert: {
          central_bank_liquidity_swaps?: number | null
          created_at?: string
          id?: string
          other_assets?: number | null
          reconciliation_status?: string | null
          report_date: string
          repurchase_agreements?: number | null
          securities_held_outright?: number | null
          total_assets?: number | null
          variance_from_soma?: number | null
        }
        Update: {
          central_bank_liquidity_swaps?: number | null
          created_at?: string
          id?: string
          other_assets?: number | null
          reconciliation_status?: string | null
          report_date?: string
          repurchase_agreements?: number | null
          securities_held_outright?: number | null
          total_assets?: number | null
          variance_from_soma?: number | null
        }
        Relationships: []
      }
      indicator_data: {
        Row: {
          created_at: string | null
          date: string
          id: string
          metadata: Json | null
          provider: string
          symbol: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          metadata?: Json | null
          provider: string
          symbol: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          provider?: string
          symbol?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      indicators: {
        Row: {
          api_endpoint: string | null
          category: string
          created_at: string
          data_source: string
          description: string | null
          fallback_enabled: boolean | null
          fallback_value: number | null
          health_check_endpoint: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          metadata: Json | null
          name: string
          pillar: number | null
          priority: number | null
          subcategory: string
          symbol: string
          update_frequency: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          category?: string
          created_at?: string
          data_source: string
          description?: string | null
          fallback_enabled?: boolean | null
          fallback_value?: number | null
          health_check_endpoint?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          name: string
          pillar?: number | null
          priority?: number | null
          subcategory?: string
          symbol: string
          update_frequency?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          category?: string
          created_at?: string
          data_source?: string
          description?: string | null
          fallback_enabled?: boolean | null
          fallback_value?: number | null
          health_check_endpoint?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          metadata?: Json | null
          name?: string
          pillar?: number | null
          priority?: number | null
          subcategory?: string
          symbol?: string
          update_frequency?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ingestion_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          indicator_id: string
          records_processed: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          indicator_id: string
          records_processed?: number | null
          started_at?: string
          status: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          indicator_id?: string
          records_processed?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_logs_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data_cache: {
        Row: {
          change: number | null
          change_percent: number | null
          created_at: string
          id: string
          metadata: Json | null
          previous_value: number | null
          provider: string
          symbol: string
          timestamp: string
          updated_at: string
          value: number
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          previous_value?: number | null
          provider: string
          symbol: string
          timestamp?: string
          updated_at?: string
          value: number
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          previous_value?: number | null
          provider?: string
          symbol?: string
          timestamp?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      market_indicators: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          source: string
          symbol: string
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          symbol: string
          timestamp?: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          symbol?: string
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      market_microstructure: {
        Row: {
          bid_ask_spread: number | null
          created_at: string
          cusip_id: string
          id: string
          liquidity_score: number | null
          order_flow_imbalance: number | null
          price_impact: number | null
          trade_volume: number | null
          trading_date: string
          volatility: number | null
        }
        Insert: {
          bid_ask_spread?: number | null
          created_at?: string
          cusip_id: string
          id?: string
          liquidity_score?: number | null
          order_flow_imbalance?: number | null
          price_impact?: number | null
          trade_volume?: number | null
          trading_date: string
          volatility?: number | null
        }
        Update: {
          bid_ask_spread?: number | null
          created_at?: string
          cusip_id?: string
          id?: string
          liquidity_score?: number | null
          order_flow_imbalance?: number | null
          price_impact?: number | null
          trade_volume?: number | null
          trading_date?: string
          volatility?: number | null
        }
        Relationships: []
      }
      master_signals: {
        Row: {
          conflict_level: string
          consensus_score: number
          created_at: string | null
          engine_count: number
          id: string
          market_regime: string
          master_signal: string
          regime_confidence: number
          signal_strength: number
        }
        Insert: {
          conflict_level: string
          consensus_score: number
          created_at?: string | null
          engine_count: number
          id?: string
          market_regime: string
          master_signal: string
          regime_confidence: number
          signal_strength: number
        }
        Update: {
          conflict_level?: string
          consensus_score?: number
          created_at?: string | null
          engine_count?: number
          id?: string
          market_regime?: string
          master_signal?: string
          regime_confidence?: number
          signal_strength?: number
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_confidence: number | null
          correct_signals: number | null
          created_at: string | null
          date: string
          false_positives: number | null
          id: string
          regime_accuracy: number | null
          total_signals: number | null
        }
        Insert: {
          avg_confidence?: number | null
          correct_signals?: number | null
          created_at?: string | null
          date: string
          false_positives?: number | null
          id?: string
          regime_accuracy?: number | null
          total_signals?: number | null
        }
        Update: {
          avg_confidence?: number | null
          correct_signals?: number | null
          created_at?: string | null
          date?: string
          false_positives?: number | null
          id?: string
          regime_accuracy?: number | null
          total_signals?: number | null
        }
        Relationships: []
      }
      soma_holdings: {
        Row: {
          change_from_previous: number | null
          coupon_rate: number | null
          created_at: string
          cusip_id: string
          holdings_date: string
          id: string
          issue_date: string | null
          market_value: number | null
          maturity_date: string | null
          par_amount: number | null
          sector: string | null
          security_description: string | null
          updated_at: string
          weighted_average_maturity: number | null
        }
        Insert: {
          change_from_previous?: number | null
          coupon_rate?: number | null
          created_at?: string
          cusip_id: string
          holdings_date: string
          id?: string
          issue_date?: string | null
          market_value?: number | null
          maturity_date?: string | null
          par_amount?: number | null
          sector?: string | null
          security_description?: string | null
          updated_at?: string
          weighted_average_maturity?: number | null
        }
        Update: {
          change_from_previous?: number | null
          coupon_rate?: number | null
          created_at?: string
          cusip_id?: string
          holdings_date?: string
          id?: string
          issue_date?: string | null
          market_value?: number | null
          maturity_date?: string | null
          par_amount?: number | null
          sector?: string | null
          security_description?: string | null
          updated_at?: string
          weighted_average_maturity?: number | null
        }
        Relationships: []
      }
      stealth_patterns: {
        Row: {
          created_at: string
          detection_algorithm: string
          false_positive_rate: number | null
          id: string
          is_active: boolean | null
          last_calibrated: string | null
          parameters: Json | null
          pattern_name: string
          pattern_type: string
          success_rate: number | null
        }
        Insert: {
          created_at?: string
          detection_algorithm: string
          false_positive_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_calibrated?: string | null
          parameters?: Json | null
          pattern_name: string
          pattern_type: string
          success_rate?: number | null
        }
        Update: {
          created_at?: string
          detection_algorithm?: string
          false_positive_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_calibrated?: string | null
          parameters?: Json | null
          pattern_name?: string
          pattern_type?: string
          success_rate?: number | null
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          component: string
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          timestamp: string | null
        }
        Insert: {
          component: string
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
        }
        Update: {
          component?: string
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          alert_settings: Json | null
          created_at: string | null
          dashboard_layout: Json | null
          engine_weights: Json | null
          id: string
          theme_settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          alert_settings?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          engine_weights?: Json | null
          id?: string
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          alert_settings?: Json | null
          created_at?: string | null
          dashboard_layout?: Json | null
          engine_weights?: Json | null
          id?: string
          theme_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_market_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_cron_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          jobname: string
          schedule: string
          command: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
