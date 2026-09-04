# MeetSphere Signaling and Security Implementation Plan

## Scope

Add authenticated real-time room choreography, durable chat persistence, an AI catch-up stub, and production-oriented HTTP/security plumbing. The existing LiveKit token service and JWT-authenticated WebSocket upgrade remain the foundation.

## Module Plan

### 1. Environment and configuration

- Update `server/.env.example` with explicit `MONGODB_URI`, `REDIS_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `JWT_SECRET`, logging, and token settings.
- Add a small configuration loader/validator under `server/config/` that reads `process.env`, rejects missing production secrets, and avoids logging secret values.
- Keep `.env` local and ignored; no credentials will be committed.

### 2. HTTP middleware

- Add `server/middleware/requestLogger.js` using the existing dependency set or a minimal structured logger.
- Add `server/middleware/errorHandler.js` for normalized JSON errors, safe production messages, and centralized logging.
- Register both middleware modules in `server/server.js` in the correct order: request logging, routes, 404 handling, then error handling.

### 3. Chat persistence and services

- Reuse `server/models/ChatMessage.js` for MongoDB persistence.
- Add `server/services/chatService.js` to validate message content, resolve the room identifier, save a `ChatMessage`, and return a broadcast-safe DTO with sender and timestamp data.
- Add `server/services/catchUpSummaryService.js` with a deterministic stub response containing room, requested range, and recent-message context; keep the AI provider boundary injectable for later integration.

### 4. WebSocket room management

- Refactor `server/sockets/signaling.js` into explicit room membership helpers or a nearby `server/websocket/roomRegistry.js` module.
- Support `join-room` and `leave-room`, while retaining compatibility aliases for the current `join` and disconnect behavior where practical.
- Track one authenticated socket identity per connection, prevent identity spoofing, clean up memberships on close, and broadcast peer/system events only to the active room.

### 5. WebSocket event handlers

- `join-room`: validate room name, move the authenticated socket into the room, acknowledge the caller, and broadcast participant join state.
- `leave-room`: remove the socket from the requested room, acknowledge the caller, and broadcast participant leave state.
- `chat-message`: validate room membership and content, persist through `chatService`, then broadcast the saved message to the room.
- `hand-raise`: validate a boolean state and broadcast the authenticated participant’s state.
- `mute-status-change`: validate a boolean muted state and broadcast the authenticated participant’s state.
- `request-catch-up-summary`: call `catchUpSummaryService` and return a request-scoped summary response without blocking other room events.
- Return consistent `{ type, requestId?, error? }` error messages for malformed or unauthorized events.

### 6. Redis choreography integration

- Use the existing `server/config/redis.js` Pub/Sub interface for cross-process room events where configured.
- Keep local WebSocket broadcasts for same-process delivery and publish normalized room events for other server instances.
- Avoid duplicate delivery by tagging origin/process identifiers or defining a clear local-versus-remote dispatch rule.

## Event Contract

Inbound messages:

- `{ type: "join-room", room: "<room-name>" }`
- `{ type: "leave-room", room: "<room-name>" }`
- `{ type: "chat-message", room: "<room-name>", content: "...", requestId?: "..." }`
- `{ type: "hand-raise", room: "<room-name>", raised: true|false }`
- `{ type: "mute-status-change", room: "<room-name>", muted: true|false }`
- `{ type: "request-catch-up-summary", room: "<room-name>", requestId?: "..." }`

Outbound messages will always identify the event in `type`, include the verified `userId`/participant identity, and include `requestId` when supplied. Chat messages will include the persisted message id and timestamp.

## Security Decisions

- JWT verification remains mandatory before WebSocket upgrade.
- The socket identity comes only from the verified JWT subject.
- Room membership is required before room-scoped events.
- Message content, room names, event types, and boolean state fields are validated at the boundary.
- Secrets are loaded from environment variables and are never included in logs or response bodies.
- Production startup fails fast when required secrets are absent; development defaults are not used for signing credentials.

## Validation Plan

1. Run `node --check` for every changed server module.
2. Run VS Code diagnostics for changed files.
3. Add focused tests or a disposable runtime probe for authenticated upgrade, room join/leave, chat persistence/broadcast contract, state events, and catch-up response.
4. Run the client production build to verify no existing client contract is broken.

## Approval Gate

This artifact is the implementation plan only. No production code for the requested event handlers or security middleware should be written until the plan is approved.