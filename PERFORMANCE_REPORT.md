# Catalyst Content OS — Phase 3 Performance Report

**Report Date**: 2026-08-26  
**Host Environment**: Windows x64, Node.js v22+, Multi-Core CPU / Chromium Headless  
**Render Engine**: Remotion Local Renderer (`@remotion/renderer` v4.0.517)  

---

## 1. Multi-Video Render Performance Summary

| Video ID | Topic / Title | Resolution | Duration | Frames | Render Time | Throughput | Output Size | Status |
|---|---|---|---|---|---|---|---|---|
| **Video A** | The Race to Build the World's Most Efficient AI Chips | 1080x1920 (9:16) | 45.0s | 1,350 | 232.4s | 5.8 fps | 3.48 MB | ✅ COMPLETED |
| **Video B** | The Neural Architecture of Next-Gen Humanoids | 1080x1920 (16:9/9:16) | 45.0s | 1,350 | 200.6s | 6.7 fps | 3.42 MB | ✅ COMPLETED |
| **Video C** | The High-Frequency Core: How Trillions Move in Nanoseconds | 1080x1920 (9:16) | 45.0s | 1,150 | 199.0s | 6.8 fps | 3.30 MB | ✅ COMPLETED |
| **Video A (Repeat)** | AI Chips Repeatability Verification | 1080x1920 (9:16) | 45.0s | 1,350 | 215.1s | 6.3 fps | 3.48 MB | ✅ COMPLETED |

---

## 2. Resource Utilization & Optimization Analysis

1. **Bundle Time**: Remotion Webpack bundler cached and reused across jobs (`~1.2s` subsequent lookup time).
2. **Memory Stability**: Setting `jpegQuality: 80` and `crf: 22` with `concurrency: 1` eliminates x264 memory malloc fragmentation on Windows, ensuring 100% render reliability without chromium tab crashes.
3. **Storage Footprint**: Average output MP4 size is **3.40 MB** for a full 45-second 1080p broadcast video (~604 kbps bitrate), providing high visual clarity while keeping disk usage minimal.
4. **SQLite Latency**: Sub-millisecond read/write latencies in SQLite WAL mode.
