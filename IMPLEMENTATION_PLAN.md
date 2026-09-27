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

## Client Meeting Experience Plan

### Scope and current anchors

The client already has initial implementations for the requested surfaces. The implementation should refine those modules rather than create a second meeting flow:

- `client/src/pages/RoomPage.jsx` owns LiveKit connection options and passes lobby settings into the room.
- `client/src/components/PreJoinScreen.jsx` owns local preview, device enumeration, and initial media state.
- `client/src/components/MeetingRoom.jsx` owns participant track selection, grid composition, and room-level layout.
- `client/src/components/ControlBar.jsx` owns in-room media actions and screen sharing.
- `client/src/components/Sidebar.jsx` owns chat and participant/hand state.
- `client/src/services/noiseSuppression.js` is the current AudioWorklet/RNNoise integration boundary.

The requested behavior will be implemented in JavaScript/JSX to match the current Vite project. “Fully typed” means component prop contracts and state shapes will be made explicit in JSDoc or equivalent local conventions unless TypeScript migration is approved separately; converting the whole client to TypeScript is outside this slice.

### Exact component hierarchy

```text
client/src/
├── pages/
│   ├── LobbyPage.jsx
│   └── RoomPage.jsx
├── components/
│   ├── PreJoinScreen.jsx
│   ├── MeetingRoom.jsx
│   ├── ParticipantTile.jsx              # new: tile media and status overlays
│   ├── ParticipantStatus.jsx            # new: mic, hand, and quality indicators
│   ├── MeetingGrid.jsx                   # new: participant-count grid rules
│   ├── ControlBar.jsx
│   ├── Sidebar.jsx
│   ├── ChatPanel.jsx                     # new: LiveKit data-message history
│   ├── ParticipantList.jsx               # new: states and raised-hand queue
│   └── NoiseSuppressionToggle.jsx        # new: AI setting presentation
├── hooks/
│   ├── useMediaDevices.js                # new: enumerate/select/replace devices
│   ├── useAudioLevel.js                  # new: preview meter lifecycle
│   ├── useParticipantSignals.js          # new: active speaker/hand/quality state
│   ├── useRoomChat.js                    # new: publish/receive LiveKit data
│   └── useNoiseSuppression.js            # new: processed-track lifecycle
└── audio/
	├── rnnoise-worklet.js                # new: AudioWorklet processor
	├── rnnoise-wasm.js                   # new: WASM loading/validation adapter
	└── createProcessedAudioTrack.js      # new: stream -> processed MediaStreamTrack
```

Existing service code may be moved into `client/src/audio/` only when the move keeps imports and cleanup behavior correct. No duplicate noise-suppression implementation should remain under `services/`.

### 1. Pre-join lobby

Update `PreJoinScreen.jsx` and the media hooks so the user can:

- Enter a required display name and room ID.
- See a live local camera preview and continuously updating audio level meter.
- Enumerate `audioinput`, `videoinput`, and `audiooutput` devices through `navigator.mediaDevices.enumerateDevices()` after permission is granted.
- Replace the active preview stream when microphone or camera selection changes.
- Apply the selected speaker with `HTMLMediaElement.setSinkId()` when supported and show a clear unsupported/error state otherwise.
- Start the room with camera and microphone independently enabled or disabled.
- Stop tracks, close the analyser/audio context, and remove device listeners on unmount.

The join payload remains compatible with `RoomPage` and contains `{ name, roomId, selected, micEnabled, cameraEnabled }`. `RoomPage` will pass the selected input devices into LiveKit and preserve the initial enabled state.

### 2. Meeting grid and participant state

Refactor `MeetingRoom.jsx` into `MeetingGrid`, `ParticipantTile`, and `ParticipantStatus` while keeping the current LiveKit Components APIs:

- Render camera tracks and screen-share tracks with stable keys and no duplicate participant tile for the same source.
- Use CSS Grid classes or a deterministic grid style for 1, 2-4, 5-9, 10-16, 17-25, and 25+ visible tiles.
- Keep tiles usable on narrow viewports and prevent status overlays from changing tile dimensions.
- Highlight `participant.isSpeaking` with a pulsing border and accessible label.
- Show microphone-muted state, hand-raised state, and a connection-quality meter on every participant tile.
- Keep local participant labeling and empty/loading states intact.

Active speaker and quality values must be derived from LiveKit participant state rather than inferred from CSS or chat messages. Hand state will be maintained from reliable LiveKit data messages and keyed by participant identity.

### 3. RNNoise AudioWorklet pipeline

Create the `client/src/audio/` boundary and `useNoiseSuppression.js` hook:

- Load a real RNNoise-compatible WASM asset through a Vite-safe URL.
- Register one AudioWorklet processor per audio context and process frames through the WASM denoiser, preserving channel/sample-rate expectations.
- Expose `{ track, stop }` cleanup and fail closed to the original microphone track with a visible error when WASM or AudioWorklet is unavailable.
- Avoid publishing two microphone tracks at once: unpublish/stop the previous publication only after the replacement track is ready, then restore the original track when disabling suppression.
- Tie all contexts, object URLs, source nodes, and tracks to React cleanup.

Add a visible “Enable AI Noise Suppression” toggle in the control surface. Its state is explicit, its failure is recoverable, and it must not silently claim suppression is active when the processor did not initialize.

### 4. Control bar and screen sharing

Update `ControlBar.jsx` to provide accessible icon buttons for:

- Mute/unmute microphone.
- Enable/disable camera.
- Start/stop screen sharing.
- Raise/lower hand.
- Open/close chat and participant sidebar.
- Enable/disable AI noise suppression.
- Leave the room.

Screen sharing will use LiveKit’s `setScreenShareEnabled` with explicit high-resolution capture settings and SVC/simulcast encoding parameters appropriate for readable text. The implementation will verify the actual LiveKit client API version in the installed package before choosing the options shape, and will handle browser “share ended” events so the button returns to the stopped state.

### 5. Chat and participant sidebar

Split `Sidebar.jsx` responsibilities into `ChatPanel` and `ParticipantList` while retaining the current sliding right-side drawer styling:

- Publish JSON chat events through `room.localParticipant.publishData(..., { reliable: true })`.
- Subscribe and unsubscribe from `RoomEvent.DataReceived` exactly once per room lifecycle.
- Render sender, timestamp, and message content with local echo deduplication using a message ID.
- Ignore malformed or unrelated data messages without breaking the subscription.
- Render participant microphone/video state, connection quality, and a raised-hand queue ordered by raise time.
- Keep the panel keyboard accessible and prevent the drawer from covering the fixed control bar on small screens.

### 6. Dependency and API verification

Before implementation:

- Verify the installed `@livekit/components-react` and `livekit-client` APIs for screen-share encoding options, participant track references, data events, and device switching.
- Verify whether a maintained RNNoise WASM package or repository asset is available. If no asset exists, add the smallest supported dependency or keep the feature explicitly disabled with an actionable configuration error; do not ship a fake denoiser.
- Do not add Shadcn/ui solely for the drawer; the existing Tailwind drawer is sufficient unless the package is already present.
- Keep `lucide-react`, the existing Tailwind tokens, and current LiveKit dependencies.

### Validation plan

1. Run the client build to catch missing imports and invalid JSX/API usage.
2. Exercise the pre-join flow with permission granted, denied, device changes, disabled initial states, and unmount cleanup.
3. Exercise grid counts at 1, 4, 9, 16, 25, and 26 visible tracks, including screen share and active speaker state.
4. Exercise microphone/camera/screen-share/hand/chat/sidebar/leave controls and verify LiveKit event cleanup.
5. Exercise RNNoise enabled, disabled, unavailable WASM, and AudioWorklet-unavailable paths; verify no duplicate microphone publication.
6. Run the client build again after fixes and inspect diagnostics for all changed modules.

### Approval gate

This client section is an implementation plan only. No client runtime code, dependency changes, or file moves should be made until the user approves the plan. After approval, implementation should proceed in small slices, beginning with media device and pre-join behavior, followed by the audio boundary, grid/status components, controls, and sidebar.