export interface SSEClient {
  write: (chunk: Uint8Array) => Promise<void>;
  cleanup: () => void;
  id: string;
  connectedAt: Date;
}

class SSEService {
  private clients = new Set<SSEClient>();
  private clientCounter = 0;

  addClient(controller: ReadableStreamDefaultController): SSEClient {
    const clientId = `client_${++this.clientCounter}_${Date.now()}`;
    let isClosed = false;

    const safeCloseController = () => {
      try {
        if (controller.desiredSize !== null) {
          controller.close();
        }
      } catch (error) {
        if (error.code !== 'ERR_INVALID_STATE') {
          console.error(`Error closing controller for ${clientId}:`, error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (!isClosed) {
        console.log(`Auto-closing SSE client ${clientId} due to timeout`);
        client.cleanup();
      }
    }, 5 * 60 * 1000);

    const client: SSEClient = {
      id: clientId,
      connectedAt: new Date(),
      write: async (chunk: Uint8Array) => {
        if (isClosed) {
          return;
        }
        try {
          controller.enqueue(chunk);
        } catch (error) {
          console.error(`Error writing to SSE client ${clientId}:`, error);
          isClosed = true;
          clearTimeout(timeoutId);
          this.removeClient(client);
          safeCloseController();
          throw error;
        }
      },
      cleanup: () => {
        if (!isClosed) {
          isClosed = true;
          clearTimeout(timeoutId);
          this.removeClient(client);
          safeCloseController();
        }
      }
    };

    this.clients.add(client);
    console.log(`SSE client connected: ${clientId} (Total: ${this.clients.size})`);
    
    return client;
  }

  private removeClient(client: SSEClient): void {
    const removed = this.clients.delete(client);
    if (removed) {
      console.log(`SSE client disconnected: ${client.id} (Total: ${this.clients.size})`);
    }
  }

  async broadcastUpdate(data: string): Promise<void> {
    if (this.clients.size === 0) {
      console.log('No SSE clients connected, skipping broadcast');
      return;
    }

    const message = `data: ${JSON.stringify({ dynamicString: data })}\n\n`;
    const encodedMessage = new TextEncoder().encode(message);
    const clientsToRemove: SSEClient[] = [];

    const promises = Array.from(this.clients).map(async (client) => {
      try {
        await client.write(encodedMessage);
      } catch (error) {
        console.error(`Failed to send to client ${client.id}:`, error);
        clientsToRemove.push(client);
      }
    });

    await Promise.allSettled(promises);

    clientsToRemove.forEach(client => client.cleanup());
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      clients: Array.from(this.clients).map(client => ({
        id: client.id,
        connectedAt: client.connectedAt,
        duration: Date.now() - client.connectedAt.getTime()
      }))
    };
  }

  cleanup(): void {
    console.log(`Cleaning up ${this.clients.size} SSE connections`);
    this.clients.forEach(client => client.cleanup());
    this.clients.clear();
  }
}

// Singleton instance
export const sseService = new SSEService();

// Export the broadcast function for backward compatibility
export const broadcastUpdate = (data: string) => sseService.broadcastUpdate(data);