import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'heartbeat' | 'update' | 'connected' | 'error';
  data?: any;
  timestamp?: string;
}

interface ClientSubscription {
  socket: WebSocket;
  subscribedEngines: Set<string>;
  lastHeartbeat: number;
}

const clients = new Map<string, ClientSubscription>();
let supabase: any;
let engineDataCache = new Map<string, any>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  // Initialize Supabase client
  supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { socket, response } = Deno.upgradeWebSocket(req);
  const clientId = crypto.randomUUID();

  socket.onopen = () => {
    console.log(`🔌 WebSocket client ${clientId} connected`);
    
    // Register client
    clients.set(clientId, {
      socket,
      subscribedEngines: new Set(),
      lastHeartbeat: Date.now()
    });

    // Send connection confirmation
    sendMessage(socket, {
      type: 'connected',
      data: { clientId, timestamp: new Date().toISOString() }
    });

    // Start heartbeat monitoring
    startHeartbeatMonitoring(clientId);
  };

  socket.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleClientMessage(clientId, message);
    } catch (error) {
      console.error(`❌ Failed to parse message from ${clientId}:`, error);
      sendMessage(socket, {
        type: 'error',
        data: { error: 'Invalid message format' }
      });
    }
  };

  socket.onclose = () => {
    console.log(`🔌 WebSocket client ${clientId} disconnected`);
    cleanup(clientId);
  };

  socket.onerror = (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
    cleanup(clientId);
  };

  // Set up Supabase real-time subscription for engine outputs
  setupSupabaseSubscription();

  return response;
});

function handleClientMessage(clientId: string, message: WebSocketMessage) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'subscribe':
      const engineIds = message.data?.engineIds || [];
      engineIds.forEach((id: string) => client.subscribedEngines.add(id));
      console.log(`📡 Client ${clientId} subscribed to engines: ${engineIds.join(', ')}`);
      
      // Send current data for subscribed engines
      sendCurrentData(client, engineIds);
      break;

    case 'unsubscribe':
      const unsubEngineIds = message.data?.engineIds || [];
      unsubEngineIds.forEach((id: string) => client.subscribedEngines.delete(id));
      console.log(`📡 Client ${clientId} unsubscribed from engines: ${unsubEngineIds.join(', ')}`);
      break;

    case 'heartbeat':
      client.lastHeartbeat = Date.now();
      sendMessage(client.socket, {
        type: 'heartbeat',
        data: { timestamp: new Date().toISOString() }
      });
      break;

    default:
      console.warn(`❓ Unknown message type from ${clientId}: ${message.type}`);
  }
}

async function setupSupabaseSubscription() {
  console.log('🔄 Setting up Supabase real-time subscriptions...');

  // Subscribe to engine outputs
  supabase
    .channel('engine_outputs_stream')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'engine_outputs'
    }, (payload: any) => {
      handleEngineOutputUpdate(payload.new);
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'engine_outputs'
    }, (payload: any) => {
      handleEngineOutputUpdate(payload.new);
    })
    .subscribe();

  // Subscribe to master signals
  supabase
    .channel('master_signals_stream')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'master_signals'
    }, (payload: any) => {
      handleMasterSignalUpdate(payload.new);
    })
    .subscribe();

  console.log('✅ Real-time subscriptions established');
}

function handleEngineOutputUpdate(engineOutput: any) {
  const engineId = engineOutput.engine_id;
  
  // Update cache
  engineDataCache.set(engineId, {
    ...engineOutput,
    timestamp: new Date().toISOString()
  });

  // Broadcast to subscribed clients
  const updateMessage: WebSocketMessage = {
    type: 'update',
    data: {
      engineId,
      output: {
        primaryMetric: {
          value: engineOutput.primary_value,
          change24h: 0, // TODO: Calculate from historical data
          changePercent: 0
        },
        signal: engineOutput.signal,
        confidence: engineOutput.confidence,
        analysis: engineOutput.analysis,
        subMetrics: engineOutput.sub_metrics || {},
        alerts: engineOutput.alerts || []
      }
    },
    timestamp: new Date().toISOString()
  };

  broadcastToSubscribers(engineId, updateMessage);
}

function handleMasterSignalUpdate(masterSignal: any) {
  const updateMessage: WebSocketMessage = {
    type: 'update',
    data: {
      engineId: 'signal-aggregator',
      output: {
        primaryMetric: {
          value: masterSignal.signal_strength,
          change24h: 0,
          changePercent: 0
        },
        signal: masterSignal.master_signal,
        confidence: masterSignal.regime_confidence,
        analysis: `Master signal: ${masterSignal.master_signal} with ${masterSignal.consensus_score}% consensus`,
        subMetrics: {
          signal_strength: masterSignal.signal_strength,
          consensus_score: masterSignal.consensus_score,
          conflict_level: masterSignal.conflict_level,
          market_regime: masterSignal.market_regime,
          engine_count: masterSignal.engine_count
        }
      }
    },
    timestamp: new Date().toISOString()
  };

  broadcastToSubscribers('signal-aggregator', updateMessage);
}

function broadcastToSubscribers(engineId: string, message: WebSocketMessage) {
  let sentCount = 0;
  
  clients.forEach((client, clientId) => {
    if (client.subscribedEngines.has(engineId) || client.subscribedEngines.has('*')) {
      try {
        sendMessage(client.socket, message);
        sentCount++;
      } catch (error) {
        console.error(`❌ Failed to send message to ${clientId}:`, error);
        cleanup(clientId);
      }
    }
  });

  if (sentCount > 0) {
    console.log(`📡 Broadcasted ${engineId} update to ${sentCount} clients`);
  }
}

function sendCurrentData(client: ClientSubscription, engineIds: string[]) {
  engineIds.forEach(engineId => {
    const cachedData = engineDataCache.get(engineId);
    if (cachedData) {
      sendMessage(client.socket, {
        type: 'update',
        data: {
          engineId,
          output: cachedData
        },
        timestamp: new Date().toISOString()
      });
    }
  });
}

function sendMessage(socket: WebSocket, message: WebSocketMessage) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function startHeartbeatMonitoring(clientId: string) {
  const interval = setInterval(() => {
    const client = clients.get(clientId);
    if (!client) {
      clearInterval(interval);
      return;
    }

    const now = Date.now();
    const timeSinceHeartbeat = now - client.lastHeartbeat;

    // Disconnect clients that haven't sent heartbeat in 30 seconds
    if (timeSinceHeartbeat > 30000) {
      console.log(`💔 Client ${clientId} heartbeat timeout, disconnecting`);
      client.socket.close();
      clearInterval(interval);
      return;
    }

    // Send ping every 10 seconds
    if (timeSinceHeartbeat % 10000 < 1000) {
      sendMessage(client.socket, {
        type: 'heartbeat',
        data: { ping: true }
      });
    }
  }, 1000);
}

function cleanup(clientId: string) {
  clients.delete(clientId);
  console.log(`🧹 Cleaned up client ${clientId}, ${clients.size} clients remaining`);
}

console.log('🚀 Real-time WebSocket server started');