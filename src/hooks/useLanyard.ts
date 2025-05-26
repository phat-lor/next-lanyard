import { useEffect, useState, useCallback } from 'react';
import { LanyardData, WebSocketOpCode } from '../types/lanyard.type';

const LANYARD_SOCKET_URL = 'wss://api.lanyard.rest/socket';
const LANYARD_API_URL = 'https://api.lanyard.rest/v1/users';

interface UseLanyardOptions {
  userId: string;
  socket?: boolean;
}

export interface LanyardError extends Error {
  code?: string;
  endpoint?: string;
  statusCode?: number;
  details?: any; // eslint-disable-line @typescript-eslint/no-explicit-any 
}

interface WebSocketInitialize {
  subscribe_to_ids?: string[];
  subscribe_to_id?: string;
  subscribe_to_all?: boolean;
}

interface WebSocketMessage {
  op: WebSocketOpCode;
  d: LanyardData | WebSocketInitialize | { heartbeat_interval: number } | null;
  t?: 'INIT_STATE' | 'PRESENCE_UPDATE';
  seq?: number;
}

// Type guards
function isHelloMessage(data: WebSocketMessage['d']): data is { heartbeat_interval: number } {
  return data !== null && 'heartbeat_interval' in data;
}

function isLanyardData(data: WebSocketMessage['d']): data is LanyardData {
  return data !== null && 'discord_user' in data;
}

export function useLanyard({ userId, socket = true }: UseLanyardOptions) {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LanyardError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackToRest, setFallbackToRest] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    lastAttempt: string;
    connectionType: 'websocket' | 'rest';
    attempts: number;
    lastEndpoint: string;
    lastResponse?: any; // eslint-disable-line @typescript-eslint/no-explicit-any 
  }>({
    lastAttempt: new Date().toISOString(),
    connectionType: socket ? 'websocket' : 'rest',
    attempts: 0,
    lastEndpoint: socket ? LANYARD_SOCKET_URL : `${LANYARD_API_URL}/${userId}`,
  });
  const MAX_RETRIES = 3;

  const createError = (message: string, details: Partial<LanyardError> = {}): LanyardError => {
    const error = new Error(message) as LanyardError;
    error.code = details.code;
    error.endpoint = details.endpoint;
    error.statusCode = details.statusCode;
    error.details = details.details;
    return error;
  };

  const fetchRestData = useCallback(async () => {
    const endpoint = `${LANYARD_API_URL}/${userId}`;
    setDebugInfo(prev => ({
      ...prev,
      lastAttempt: new Date().toISOString(),
      connectionType: 'rest',
      attempts: prev.attempts + 1,
      lastEndpoint: endpoint
    }));

    try {
      const response = await fetch(endpoint);
      const json = await response.json();
      setDebugInfo(prev => ({ ...prev, lastResponse: json }));

      if (!response.ok) {
        throw createError(`HTTP Error: ${response.status} ${response.statusText}`, {
          code: 'HTTP_ERROR',
          endpoint,
          statusCode: response.status,
          details: json
        });
      }

      if (!json.success) {
        throw createError('API Error: Request was not successful', {
          code: 'API_ERROR',
          endpoint,
          details: json
        });
      }

      if (!json.data) {
        throw createError('User Not Found', {
          code: 'USER_NOT_FOUND',
          endpoint,
          details: { userId }
        });
      }

      setData(json.data);
      setError(null);
    } catch (err: unknown) {
      const isNetworkError = err instanceof TypeError && err.message === 'Failed to fetch';
      const errorMessage = isNetworkError 
        ? 'Network Error: Failed to reach Lanyard API' 
        : (err instanceof Error ? err.message : 'Unknown error occurred');
      
      const error = createError(errorMessage, {
        code: isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR',
        endpoint,
        details: err
      });

      setError(error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // If we're not using socket or if we've fallen back to REST, use REST API
    if (!socket || fallbackToRest) {
      fetchRestData();
      const interval = setInterval(fetchRestData, 30000);
      return () => clearInterval(interval);
    }

    let ws: WebSocket | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isConnecting = false;
    let isMounted = true;

    const clearIntervals = () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const connect = () => {
      if (!isMounted || isConnecting) return;
      isConnecting = true;

      try {
        setDebugInfo(prev => ({
          ...prev,
          lastAttempt: new Date().toISOString(),
          connectionType: 'websocket',
          attempts: prev.attempts + 1,
          lastEndpoint: LANYARD_SOCKET_URL
        }));

        ws = new WebSocket(LANYARD_SOCKET_URL);

        ws.onopen = () => {
          isConnecting = false;
          if (!isMounted) {
            ws?.close();
            return;
          }

          console.log('WebSocket connected', { userId, endpoint: LANYARD_SOCKET_URL });
          setError(null);
          setRetryCount(0);
          ws?.send(
            JSON.stringify({
              op: WebSocketOpCode.Initialize,
              d: {
                subscribe_to_id: userId
              }
            })
          );
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;

          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setDebugInfo(prev => ({ ...prev, lastResponse: message }));

            switch (message.op) {
              case WebSocketOpCode.Hello:
                if (message.d && isHelloMessage(message.d)) {
                  if (heartbeatInterval) clearInterval(heartbeatInterval);
                  heartbeatInterval = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({ op: WebSocketOpCode.Heartbeat }));
                    }
                  }, message.d.heartbeat_interval);
                }
                break;

              case WebSocketOpCode.Event:
                if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
                  if (!message.d) {
                    throw createError('User Not Found', {
                      code: 'USER_NOT_FOUND',
                      endpoint: LANYARD_SOCKET_URL,
                      details: { userId, message }
                    });
                  }
                  if (isLanyardData(message.d)) {
                    setData(message.d);
                    setLoading(false);
                    setError(null);
                  }
                }
                break;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            if (isMounted) {
              setError(createError('WebSocket Message Error', {
                code: 'WS_MESSAGE_ERROR',
                endpoint: LANYARD_SOCKET_URL,
                details: { error: err, event: event.data }
              }));
            }
          }
        };

        ws.onerror = (error) => {
          isConnecting = false;
          console.error('WebSocket error:', error);
          
          if (!isMounted) return;

          const wsError = createError('WebSocket Connection Error', {
            code: 'WS_CONNECTION_ERROR',
            endpoint: LANYARD_SOCKET_URL,
            details: error
          });
          
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
          } else {
            setError(wsError);
            setFallbackToRest(true);
          }
        };

        ws.onclose = () => {
          isConnecting = false;
          console.log('WebSocket closed', { userId, retryCount });
          clearIntervals();
          
          if (!isMounted) return;
          
          if (retryCount < MAX_RETRIES && !fallbackToRest) {
            const delay = 2000 * (retryCount + 1);
            console.log(`Attempting to reconnect in ${delay}ms...`);
            reconnectTimeout = setTimeout(connect, delay);
          } else {
            setFallbackToRest(true);
          }
        };
      } catch (err) {
        isConnecting = false;
        console.error('Error creating WebSocket:', err);
        
        if (!isMounted) return;

        setError(createError('WebSocket Creation Error', {
          code: 'WS_CREATION_ERROR',
          endpoint: LANYARD_SOCKET_URL,
          details: err
        }));
        setFallbackToRest(true);
      }
    };

    connect();

    return () => {
      isMounted = false;
      clearIntervals();
      if (ws) {
        ws.close();
      }
    };
  }, [userId, socket, retryCount, fetchRestData, fallbackToRest]);

  return { data, loading, error, debugInfo };
}

// Helper function to get user avatar URL
export function getLanyardAvatarUrl(userId: string, format: 'png' | 'gif' | 'webp' | 'jpg' | 'jpeg' = 'png') {
  return `https://api.lanyard.rest/${userId}.${format}`;
} 