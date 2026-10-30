// lib/socket.ts
import { refreshSession, expire } from "./http"; // export both from http.ts

export async function connectSocket(path: string): Promise<WebSocket> {
  const open = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:8000${path}`);
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error("socket failed"));
    });

  try {
    return await open();
  } catch {
    // probably an expired access cookie: refresh once, then retry
    if (!(await refreshSession())) {
      expire();
      throw new Error("Session expired");
    }
    return open();
  }
}