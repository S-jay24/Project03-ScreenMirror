# GravityStream: Project Execution Plan

This document outlines the roadmap for building a premium FireTV mirroring application.

## 1. Vision
A low-latency, native-feel mirroring app for FireOS, supporting AirPlay, Google Cast, and DLNA with a "Pro Max" UI/UX.

## 2. Technical Stack
- **Frontend**: Next.js 16, Tailwind CSS, Framer Motion.
- **Components**: Premium interactive UI from `21st.dev`.
- **Testing**: TDD with Vitest and React Testing Library.
- **Protocols**: 
  - AirPlay (mDNS/RTSP)
  - Google Cast (Receiver API)
  - DLNA/UPnP

## 3. Implementation Roadmap

### Phase 1: Infrastructure (Completed)
- [x] Next.js Scaffold with App Router.
- [x] GitHub Repository Integration.
- [x] Vercel Production Deployment.
- [x] TDD Environment (Vitest) setup.

### Phase 2: Premium UI/UX (Current)
- [ ] Implement Ambient Backgrounds & Glassmorphism.
- [ ] Develop 'Discovery Mode' interactive dashboard.
- [ ] Build D-Pad friendly navigation system.

### Phase 3: Mirroring Protocols
- [ ] Implement AirPlay Service discovery.
- [ ] Implement Cast Receiver logic.
- [ ] Real-time stream decoding for FireTV.

### Phase 4: Project Management (Background)
- [ ] Jira/Confluence integration for 'PR01' space once API stabilizes.

## 4. TDD Workflow
Every feature starts with a test in `src/__tests__`. No code is written until a test fails.
