# Things That Could Be Improved

## Memory Leak Issues

### Client-Side Issues

- **Infinite reconnection loop** in `src/pages/index.astro:66-70` and `src/pages/admin.astro:156-162`
  - Keeps creating new EventSource connections without proper cleanup
  - Each failed connection attempt creates a new EventSource without closing the previous one
  - Browser memory accumulation due to event listeners and connection objects

- **No connection limit enforcement**
  - Each reconnection attempt potentially accumulates event listeners
  - No maximum reconnection attempts defined
  - Can lead to exponential memory growth in unstable network conditions

### Server-Side Issues

- **Clients never properly removed** from the Set in `src/pages/events.ts:5`
  - Dead connections remain in memory indefinitely
  - No mechanism to detect and clean up stale connections
  - Memory grows linearly with each new client connection

- **No connection limits or timeouts**
  - Unlimited concurrent SSE connections allowed
  - No idle connection timeout mechanism
  - No maximum client limit enforcement

- **Inefficient cleanup mechanism**
  - `cancel()` method in `src/pages/events.ts:73-81` cleans up ALL clients instead of just the disconnected one
  - No proper association between streams and their corresponding clients

### High Traffic Scenarios

- **Broadcast to all clients simultaneously**
  - Each text update in `src/pages/events.ts:7-28` broadcasts to ALL connected clients
  - No batching or throttling mechanism
  - Can overwhelm server resources with many concurrent clients

- **No rate limiting**
  - `/update/text` endpoint has no rate limiting
  - Potential DOS vector if someone spams text updates
  - No protection against malicious or accidental flooding

- **Memory overflow potential**
  - With high traffic, server memory can grow indefinitely
  - No monitoring or alerting for memory usage
  - Browser clients can accumulate excessive connection objects

## Recommended Solutions

### 1. Connection Management
- Implement maximum concurrent SSE connections (e.g., 100 clients)
- Add connection timeout (e.g., 30 minutes for idle connections)
- Implement proper client-to-stream association for targeted cleanup

### 2. Reconnection Logic Improvements
- Add exponential backoff for reconnections (start at 1s, max 30s)
- Limit maximum reconnection attempts (e.g., 10 attempts)
- Properly close existing EventSource before creating new ones
- Add connection state tracking to prevent multiple simultaneous connections

### 3. Cleanup Mechanisms
- Implement heartbeat/ping mechanism to detect dead connections
- Add periodic cleanup job to remove stale clients
- Implement proper stream lifecycle management
- Add connection monitoring and logging

### 4. Rate Limiting and Protection
- Add rate limiting to `/update/text` endpoint (e.g., 10 requests/minute per IP)
- Implement request throttling for broadcast updates
- Add input validation and sanitization
- Consider implementing authentication for admin endpoints

### 5. Monitoring and Observability
- Track active connection count
- Log memory usage patterns and connection lifecycle events
- Monitor for connection leaks and unusual patterns
- Add health check endpoints for system monitoring

### 6. Alternative Architecture Considerations
For high-traffic scenarios, consider:
- WebSockets with proper connection pooling
- Message queue system (Redis pub/sub, RabbitMQ)
- Server-Sent Events with Redis for horizontal scaling
- CDN-based real-time updates for static content

### 7. Browser-Side Improvements
- Implement connection state management
- Add proper error handling and user feedback
- Implement client-side caching to reduce server load
- Add visibility API to pause connections when tab is inactive

## Current Error Context
The recent "Controller is already closed" errors were caused by attempting to write to closed ReadableStream controllers when clients disconnected. While this specific issue has been fixed, it highlighted the broader memory management problems described above.