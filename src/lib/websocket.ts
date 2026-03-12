const WS_BASE = 'wss://p417pa2mu2.execute-api.us-east-1.amazonaws.com/prod';

export type WSMessage =
  | { type: 'start'; message: string }
  | { type: 'chunk'; text: string }
  | { type: 'end'; message: string }
  | { type: 'error'; error: string }
  | { type: 'history'; messages: Array<{ role: string; content: string; timestamp: string }> }
  | { type: 'clear_complete' };

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private onMessage: (msg: WSMessage) => void;
  private onOpen: () => void;
  private onClose: () => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(handlers: {
    onMessage: (msg: WSMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }) {
    this.onMessage = handlers.onMessage;
    this.onOpen = handlers.onOpen || (() => {});
    this.onClose = handlers.onClose || (() => {});
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('kdb_id_token') || '' : '';
    if (!token) return;

    try {
      this.ws = new WebSocket(`${WS_BASE}?token=${encodeURIComponent(token)}`);
    } catch (_e) {
      this.onClose();
      return;
    }

    this.ws.onopen = () => this.onOpen();
    this.ws.onclose = () => { this.ws = null; this.onClose(); };
    this.ws.onerror = () => { this.ws?.close(); };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          this.onMessage({ type: 'error', error: data.error });
        } else {
          this.onMessage(data as WSMessage);
        }
      } catch (_e) {
        this.onMessage({ type: 'chunk', text: event.data });
      }
    };
  }

  send(payload: { action: string; [key: string]: unknown }) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
