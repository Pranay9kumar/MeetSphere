# MeetSphere Client SPA

Modern React (Vite) client application for **MeetSphere** — an enterprise video collaboration workspace.

## Key Features

- **Solid Dark Meeting UI**: Clean, solid dark theme (`bg-slate-900` / `bg-surface-container`) optimized for video clarity, high contrast, and reduced GPU overhead (no backdrop blur filters).
- **Participant Display Names**: Automatic user name resolution across video tiles, active speaker banners, and participant lists using authenticated user profile attributes and LiveKit token metadata.
- **WebRTC & SFU Video**: Built with `@livekit/components-react` and `livekit-client` for multi-party video conferencing, screen sharing, and audio controls.
- **AI Noise Suppression**: Client-side audio processing powered by RNNoise WebAssembly module to eliminate background noise.
- **Cloud Recording**: Integrated recording controls with LiveKit Egress status indicators and email notification delivery.
- **Real-Time Workspace**: Persistent channels, document collaboration, and instant meeting room creation.

## Getting Started

### Prerequisites

- Node.js v18+
- Active MeetSphere backend server (`http://localhost:5000`)
- Running LiveKit SFU instance

### Installation & Launch

```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open `http://localhost:3000` (or your configured Vite port) to access the workspace.
