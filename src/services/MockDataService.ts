import { supabase } from "@/integrations/supabase/client";

export interface MockEngineOutput {
  engine_id: string;
  signal: string;
  confidence: number;
  primary_value: number;
  pillar: number;
  analysis: string;
  sub_metrics: Record<string, any>;
  alerts: any[];
}

export class MockDataService {
  private static instance: MockDataService;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  async generateMockEngineOutputs(): Promise<void> {
    const mockOutputs: MockEngineOutput[] = [
      // Liquidity Engines (Pillar 2)
      {
        engine_id: "net_liquidity",
        signal: "bullish",
        confidence: 85,
        primary_value: 2.1,
        pillar: 2,
        analysis: "Net liquidity expanding, Fed balance sheet growth outpacing Treasury issuance",
        sub_metrics: {
          fed_balance_sheet: 7800.5,
          treasury_issuance: 450.2,
          net_liquidity_change: 1250.3,
          trend_direction: "up"
        },
        alerts: []
      },
      {
        engine_id: "credit_stress",
        signal: "neutral",
        confidence: 72,
        primary_value: 315.8,
        pillar: 2,
        analysis: "HY spreads stable at 316bps, below stress threshold of 400bps",
        sub_metrics: {
          hy_oas: 315.8,
          ig_spreads: 95.4,
          credit_impulse: 0.2,
          stress_level: "low"
        },
        alerts: []
      },
      // Momentum Engines (Pillar 1)
      {
        engine_id: "enhanced_momentum",
        signal: "bullish",
        confidence: 78,
        primary_value: 6.8,
        pillar: 1,
        analysis: "Multi-timeframe momentum strong across 21d-252d windows",
        sub_metrics: {
          momentum_21d: 1.8,
          momentum_63d: 2.1,
          momentum_126d: 1.9,
          momentum_252d: 2.2,
          z_score: 1.4
        },
        alerts: []
      },
      {
        engine_id: "volatility_regime",
        signal: "neutral",
        confidence: 68,
        primary_value: 18.5,
        pillar: 1,
        analysis: "Volatility regime transitioning from low to normal",
        sub_metrics: {
          vix_level: 18.5,
          regime_state: "normal",
          regime_probability: 0.68,
          transition_signal: "neutral"
        },
        alerts: []
      },
      // Systemic Risk Engines (Pillar 3)
      {
        engine_id: "tail_risk",
        signal: "neutral",
        confidence: 75,
        primary_value: 2.8,
        pillar: 3,
        analysis: "Tail risk metrics elevated but not in danger zone",
        sub_metrics: {
          var_95: 2.8,
          skew_index: 15.2,
          tail_hedge_cost: 1.1,
          stress_indicator: 0.3
        },
        alerts: []
      },
      // Macro Engines (Pillar 4)
      {
        engine_id: "macro_factor",
        signal: "bullish",
        confidence: 82,
        primary_value: 51.2,
        pillar: 4,
        analysis: "ISM PMI above 50, indicating expansion",
        sub_metrics: {
          ism_pmi: 51.2,
          new_orders: 52.8,
          employment: 49.1,
          growth_nowcast: 2.1
        },
        alerts: []
      },
      // Synthesis Engines (Pillar 5)
      {
        engine_id: "signal_aggregator",
        signal: "bullish",
        confidence: 87,
        primary_value: 6.8,
        pillar: 5,
        analysis: "Consensus bullish signal with high confidence across pillars",
        sub_metrics: {
          clis_score: 6.8,
          consensus_strength: 0.87,
          conflict_level: "low",
          signal_count: 18
        },
        alerts: []
      },
      {
        engine_id: "regime_classifier",
        signal: "risk_on",
        confidence: 79,
        primary_value: 0.79,
        pillar: 5,
        analysis: "Risk-on regime with moderate confidence",
        sub_metrics: {
          regime_state: "risk_on",
          regime_confidence: 0.79,
          transition_probability: 0.21,
          regime_duration: 45
        },
        alerts: []
      }
    ];

    try {
      // Clear existing mock data
      await supabase
        .from('engine_outputs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert mock data
      for (const output of mockOutputs) {
        await supabase
          .from('engine_outputs')
          .insert({
            engine_id: output.engine_id,
            signal: output.signal,
            confidence: output.confidence,
            primary_value: output.primary_value,
            pillar: output.pillar,
            analysis: output.analysis,
            sub_metrics: output.sub_metrics,
            alerts: output.alerts,
            calculated_at: new Date().toISOString()
          });
      }

      console.log('Mock engine outputs generated successfully');
    } catch (error) {
      console.error('Error generating mock data:', error);
      throw error;
    }
  }

  async generateMockMasterSignal(): Promise<void> {
    try {
      // Clear existing master signals
      await supabase
        .from('master_signals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert mock master signal
      await supabase
        .from('master_signals')
        .insert({
          master_signal: 'bullish',
          signal_strength: 87,
          consensus_score: 85,
          conflict_level: 'low',
          market_regime: 'risk_on',
          regime_confidence: 79,
          engine_count: 8,
          created_at: new Date().toISOString()
        });

      console.log('Mock master signal generated successfully');
    } catch (error) {
      console.error('Error generating mock master signal:', error);
      throw error;
    }
  }

  async populateAllMockData(): Promise<void> {
    await this.generateMockEngineOutputs();
    await this.generateMockMasterSignal();
  }
}

export const mockDataService = MockDataService.getInstance();