/**
 * LIQUIDITY² Terminal - Data Integration Service
 * Connects frontend to real-time engine outputs from Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { EngineOutput } from '@/engines/BaseEngine';

export class TerminalDataService {
  private static instance: TerminalDataService;
  private engineOutputs = new Map<string, EngineOutput>();
  private subscribers = new Set<(data: Map<string, EngineOutput>) => void>();

  static getInstance(): TerminalDataService {
    if (!TerminalDataService.instance) {
      TerminalDataService.instance = new TerminalDataService();
    }
    return TerminalDataService.instance;
  }

  async initialize() {
    // Fetch initial engine outputs
    await this.fetchLatestEngineOutputs();
    
    // Set up real-time subscriptions
    this.setupRealtimeSubscriptions();
    
    // Start periodic data fetching
    this.startPeriodicUpdates();
  }

  private async fetchLatestEngineOutputs() {
    try {
      const { data, error } = await supabase
        .from('engine_outputs')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (error) throw error;

      // Group by engine_id, keep latest
      const latestOutputs = new Map<string, any>();
      data?.forEach(output => {
        if (!latestOutputs.has(output.engine_id)) {
          latestOutputs.set(output.engine_id, {
            primaryMetric: {
              value: output.primary_value,
              change24h: 0, // TODO: Calculate from historical data
              changePercent: 0
            },
            signal: output.signal,
            confidence: output.confidence,
            analysis: output.analysis,
            subMetrics: output.sub_metrics || {},
            alerts: output.alerts || []
          });
        }
      });

      this.engineOutputs = latestOutputs;
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to fetch engine outputs:', error);
    }
  }

  private setupRealtimeSubscriptions() {
    // Subscribe to engine_outputs changes
    supabase
      .channel('engine_outputs_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'engine_outputs'
      }, payload => {
        this.handleEngineOutputUpdate(payload.new);
      })
      .subscribe();

    // Subscribe to master_signals changes
    supabase
      .channel('master_signals_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'master_signals'
      }, payload => {
        this.handleMasterSignalUpdate(payload.new);
      })
      .subscribe();
  }

  private handleEngineOutputUpdate(newOutput: any) {
    const engineOutput: EngineOutput = {
      primaryMetric: {
        value: newOutput.primary_value,
        change24h: 0,
        changePercent: 0
      },
      signal: newOutput.signal,
      confidence: newOutput.confidence,
      analysis: newOutput.analysis,
      subMetrics: newOutput.sub_metrics || {},
      alerts: newOutput.alerts || []
    };

    this.engineOutputs.set(newOutput.engine_id, engineOutput);
    this.notifySubscribers();
  }

  private handleMasterSignalUpdate(newSignal: any) {
    // Update master signal in the aggregator engine output
    const masterOutput: EngineOutput = {
      primaryMetric: {
        value: newSignal.signal_strength,
        change24h: 0,
        changePercent: 0
      },
      signal: newSignal.master_signal,
      confidence: newSignal.regime_confidence,
      analysis: `Master signal: ${newSignal.master_signal} with ${newSignal.consensus_score}% consensus`,
      subMetrics: {
        signal_strength: newSignal.signal_strength,
        consensus_score: newSignal.consensus_score,
        conflict_level: newSignal.conflict_level,
        market_regime: newSignal.market_regime,
        engine_count: newSignal.engine_count
      }
    };

    this.engineOutputs.set('signal-aggregator', masterOutput);
    this.notifySubscribers();
  }

  private startPeriodicUpdates() {
    // Trigger live data fetch every 5 minutes with authentication
    setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('No valid session for periodic update');
          return;
        }

        const { error } = await supabase.functions.invoke('live-data-fetch', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          },
          body: { trigger: 'periodic_update' }
        });
        
        if (!error) {
          console.log('✓ Periodic data update triggered');
        } else {
          console.error('Periodic update failed:', error);
        }
      } catch (error) {
        console.error('Periodic update failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  subscribe(callback: (data: Map<string, EngineOutput>) => void) {
    this.subscribers.add(callback);
    // Immediately notify with current data
    callback(this.engineOutputs);
  }

  unsubscribe(callback: (data: Map<string, EngineOutput>) => void) {
    this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.engineOutputs));
  }

  getEngineOutput(engineId: string): EngineOutput | undefined {
    return this.engineOutputs.get(engineId);
  }

  getAllEngineOutputs(): Map<string, EngineOutput> {
    return new Map(this.engineOutputs);
  }

  async triggerDataUpdate(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No valid session for data update');
      }

      const { error } = await supabase.functions.invoke('live-data-fetch', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { trigger: 'manual_update' }
      });
      
      if (error) {
        throw new Error(`Data update failed: ${error.message}`);
      }
      
      console.log('✓ Manual data update triggered');
    } catch (error) {
      console.error('Manual data update failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const terminalDataService = TerminalDataService.getInstance();
