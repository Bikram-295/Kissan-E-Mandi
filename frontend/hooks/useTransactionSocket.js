import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { wsBaseURL } from '../urls';
import {
  updateTransactionStatus,
  addTransaction,
  setWsConnected,
} from '../store/slices/transactionSlice';

export const useTransactionSocket = (userId) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!userId) return;

    try {
      // Determine ws protocol based on http/https
      let url = `${wsBaseURL}transactions/${userId}/`;
      if (url.startsWith('http://')) {
        url = url.replace('http://', 'ws://');
      } else if (url.startsWith('https://')) {
        url = url.replace('https://', 'wss://');
      }

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`[WebSocket] Connected for user: ${userId}`);
        setIsConnected(true);
        dispatch(setWsConnected(true));
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', payload);

          if (
            payload.type === 'transaction_status_changed' ||
            payload.type === 'lifecycle_update'
          ) {
            const txData = payload.data?.transaction || payload.data;
            if (txData && txData.id) {
              dispatch(updateTransactionStatus(txData));
            }
          } else if (payload.type === 'new_offer_created') {
            const txData = payload.data?.transaction || payload.data;
            if (txData && txData.id) {
              dispatch(addTransaction(txData));
            }
          }
        } catch (parseErr) {
          console.error('[WebSocket] Failed to parse message:', parseErr);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Error occurred:', err.message || err);
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Connection closed (code: ${event.code}). Scheduling reconnect...`);
        setIsConnected(false);
        dispatch(setWsConnected(false));
        // Exponential backoff reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (e) {
      console.error('[WebSocket] Setup exception:', e);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, connect]);

  const sendPing = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'ping' }));
    }
  }, []);

  return { isConnected, sendPing };
};

export default useTransactionSocket;
