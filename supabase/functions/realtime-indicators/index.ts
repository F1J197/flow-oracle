import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'heartbeat' | 'update' | 'error';
  indicatorId?: string;
  data?: any;
  timestamp?: string;
  error?: string;
}

interface ClientSubscription {
  socket: WebSocket;
  indicatorIds: Set<string>;
  lastHeartbeat: Date;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Client state management
  const clientSubscription: ClientSubscription = {
    socket,
    indicatorIds: new Set(),
    lastHeartbeat: new Date()
  };

  // Subscribe to database changes for real-time updates
  const channel = supabase
    .channel('indicators-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'data_points'
      },
      async (payload) => {
        console.log('Database change detected:', payload);
        await handleDatabaseChange(payload);
      }
    )
    .subscribe();

  console.log('WebSocket connection established for indicators');

  socket.onopen = () => {
    console.log('Client WebSocket opened');
    
    // Send initial connection confirmation
    sendMessage({
      type: 'update',
      data: { status: 'connected' },
      timestamp: new Date().toISOString()
    });

    // Start heartbeat monitoring
    startHeartbeatMonitoring();
  };

  socket.onmessage = async (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      await handleClientMessage(message);
    } catch (error) {
      console.error('Error handling client message:', error);
      sendMessage({
        type: 'error',
        error: 'Invalid message format'
      });
    }
  };

  socket.onclose = () => {
    console.log('Client WebSocket closed');
    cleanup();
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Handle messages from client
  async function handleClientMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        if (message.indicatorId) {
          clientSubscription.indicatorIds.add(message.indicatorId);
          console.log(`Client subscribed to indicator: ${message.indicatorId}`);
          
          // Send current value if available
          await sendCurrentValue(message.indicatorId);
        }
        break;

      case 'unsubscribe':
        if (message.indicatorId) {
          clientSubscription.indicatorIds.delete(message.indicatorId);
          console.log(`Client unsubscribed from indicator: ${message.indicatorId}`);
        }
        break;

      case 'heartbeat':
        clientSubscription.lastHeartbeat = new Date();
        sendMessage({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  // Handle database changes and notify subscribed clients
  async function handleDatabaseChange(payload: any) {
    try {
      // Get indicator information from the change
      const { new: newRecord, old: oldRecord, eventType } = payload;
      
      if (!newRecord?.indicator_id) {
        return;
      }

      // Get indicator metadata
      const { data: indicator, error } = await supabase
        .from('indicators')
        .select('symbol, name')
        .eq('id', newRecord.indicator_id)
        .single();

      if (error || !indicator) {
        console.error('Error fetching indicator metadata:', error);
        return;
      }

      // Check if any client is subscribed to this indicator
      const indicatorSymbol = indicator.symbol.toLowerCase();
      const isSubscribed = Array.from(clientSubscription.indicatorIds).some(id => 
        id.toLowerCase().includes(indicatorSymbol) || 
        indicatorSymbol.includes(id.toLowerCase())
      );

      if (!isSubscribed) {
        return;
      }

      // Calculate change metrics if we have old data
      let change = null;
      let changePercent = null;
      
      if (oldRecord?.value && newRecord.value) {
        change = newRecord.value - oldRecord.value;
        changePercent = (change / oldRecord.value) * 100;
      }

      // Send update to client
      sendMessage({
        type: 'update',
        indicatorId: indicator.symbol,
        data: {
          value: newRecord.value,
          previous: oldRecord?.value,
          change,
          changePercent,
          timestamp: newRecord.timestamp,
          confidence: newRecord.confidence_score || 1.0,
          quality: 1.0 // Default quality score
        },
        timestamp: new Date().toISOString()
      });

      console.log(`Sent real-time update for ${indicator.symbol}: ${newRecord.value}`);
    } catch (error) {
      console.error('Error handling database change:', error);
    }
  }

  // Send current value for newly subscribed indicator
  async function sendCurrentValue(indicatorId: string) {
    try {
      // Get the latest data point for this indicator
      const { data: latestPoint, error } = await supabase
        .from('data_points')
        .select(`
          value,
          timestamp,
          confidence_score,
          indicators!inner(symbol, name)
        `)
        .ilike('indicators.symbol', `%${indicatorId}%`)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error || !latestPoint) {
        console.log(`No current data found for indicator: ${indicatorId}`);
        return;
      }

      // Get previous value for change calculation
      const { data: previousPoint } = await supabase
        .from('data_points')
        .select('value')
        .ilike('indicators.symbol', `%${indicatorId}%`)
        .order('timestamp', { ascending: false })
        .range(1, 1)
        .single();

      let change = null;
      let changePercent = null;
      
      if (previousPoint?.value && latestPoint.value) {
        change = latestPoint.value - previousPoint.value;
        changePercent = (change / previousPoint.value) * 100;
      }

      sendMessage({
        type: 'update',
        indicatorId,
        data: {
          value: latestPoint.value,
          previous: previousPoint?.value,
          change,
          changePercent,
          timestamp: latestPoint.timestamp,
          confidence: latestPoint.confidence_score || 1.0,
          quality: 1.0
        },
        timestamp: new Date().toISOString()
      });

      console.log(`Sent current value for ${indicatorId}: ${latestPoint.value}`);
    } catch (error) {
      console.error(`Error fetching current value for ${indicatorId}:`, error);
    }
  }

  // Send message to client
  function sendMessage(message: WebSocketMessage) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  // Start heartbeat monitoring
  function startHeartbeatMonitoring() {
    const heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastHeartbeat = now.getTime() - clientSubscription.lastHeartbeat.getTime();
      
      // If no heartbeat received in 2 minutes, close connection
      if (timeSinceLastHeartbeat > 120000) {
        console.log('Client heartbeat timeout, closing connection');
        socket.close();
        return;
      }

      // Send heartbeat ping every 30 seconds
      if (timeSinceLastHeartbeat > 30000) {
        sendMessage({
          type: 'heartbeat',
          timestamp: now.toISOString()
        });
      }
    }, 30000);

    // Store interval ID for cleanup
    (clientSubscription as any).heartbeatInterval = heartbeatInterval;
  }

  // Cleanup function
  function cleanup() {
    console.log('Cleaning up WebSocket connection');
    
    // Unsubscribe from database changes
    supabase.removeChannel(channel);
    
    // Clear heartbeat interval
    if ((clientSubscription as any).heartbeatInterval) {
      clearInterval((clientSubscription as any).heartbeatInterval);
    }
    
    // Clear subscriptions
    clientSubscription.indicatorIds.clear();
  }

  return response;
});