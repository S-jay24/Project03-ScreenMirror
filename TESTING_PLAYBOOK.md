# GravityStream Mirroring: Testing & Simulation Playbook

This guide explains how we will move from a mocked UI to a real-world test where your iPhone detects the FireTV.

## 1. How Simulation Works (Local Development)
Since the mirroring protocol (AirPlay) involves binary RTSP streams and mDNS broadcasts, we simulate the "Discovery" and "Handshake" in the development environment:

- **Mock Discovery**: The current Dashboard uses a `setTimeout` simulated discovery.
- **Protocol Simulation**: I will create a Node.js utility (`scripts/simulate-protocol.ts`) that uses `bonjour-service` to broadcast a real mDNS packet on your local network.
- **Verification**: Your iPhone will see "GravityStream (Sim)" in the AirPlay list even before we deploy the full player.

## 2. Real-Device Naming & Connection
- **Device Name**: By default, it will be `GravityStream [FireTV]`.
- **Visibility**: It will appear natively in:
  - **iPhone**: Control Center > Screen Mirroring.
  - **Mac**: Control Center > Screen Mirroring.
  - **Android**: Settings > Connected Devices > Cast.
- **Connection**: You select the name. The FireTV app receives the request, opens the "Mirroring Dashboard," and negotiates the stream.

## 3. The Full Implementation & Test Plan

### Phase A: The "Signal" Test (Next Step)
1. **Develop**: Create a background Node.js service that broadcasts the AirPlay `_airplay._tcp` service type.
2. **Test**: You run this script on your laptop.
3. **Verify**: You check your iPhone to see if "GravityStream" appears. **(NO DASHBOARD RE-DEPLOY YET)**.

### Phase B: The "Negotiation" Test
1. **Develop**: Implement the RTSP/PTP handshake logic.
2. **Verify**: When you click the device on your iPhone, the Dashboard UI updates to "Connecting...".

### Phase C: The "Stream" Test
1. **Develop**: Integrate the video decoder (FFmpeg/WebAssembly) to display the actual pixels.
2. **Verify**: Your iPhone screen appears on the Dashboard.

## 🛑 User Confirmation Checkpoints
1. **Checkpoint 1**: Approval of the Simulation Protocol (Phase A).
2. **Checkpoint 2**: Local Test of "Phase A" on your terminal/network.
3. **Checkpoint 3**: Approval to deploy the Protocol Engine to Vercel/Firestick.

---

> [!IMPORTANT]
> To test Phase A locally, you will need to run the app on your laptop while it's connected to the **same Wi-Fi network** as your iPhone.
