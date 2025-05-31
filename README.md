# Next.js Lanyard Integration

Simple example of how to integrate Lanyard with Next.js to display Discord presence.

This is an implementation example of [Lanyard](https://github.com/Phineas/lanyard) - a service that exposes your Discord presence and activities to a RESTful API and WebSocket.

<img src="https://storage.googleapis.com/lanyard/static/lanyardtemplogo.png" alt="Lanyard Logo" width="300"/>

## Key Files

### Types
Check [src/types/lanyard.type.ts](src/types/lanyard.type.ts) for all Lanyard type definitions and interfaces.

### Usage Example
See [src/components/DiscordPresence.tsx](src/components/DiscordPresence.tsx) for an example of how to implement Lanyard in a React component.

### Hook Implementation
The main Lanyard hook is in [src/hooks/useLanyard.ts](src/hooks/useLanyard.ts) - handles both WebSocket and REST API connections.

## Screenshot
![image](https://github.com/user-attachments/assets/a4b7d97b-2f1e-43fb-a3af-08da4a13387d)
