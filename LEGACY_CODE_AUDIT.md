# Legacy Code Audit — Catalyst Content OS (Phase 3)

**Audit Date**: 2026-08-26  
**Auditor**: Catalyst Hardening & Safety Agent  

---

## 1. Executive Summary

This audit catalogs and classifies legacy prototypes, cloud integrations, and unused dependencies to verify that the local-first production pipeline operates with zero external cloud dependencies (no AWS, no Supabase, no Python, no HyperFrames).

---

## 2. Component Classification Matrix

| Component / File | Purpose | Classification | Action Taken |
|---|---|---|---|
| `src/lib/rendering/lambda.ts` | AWS Lambda rendering client | **Optional Cloud Extension** | Preserved for future multi-tenant deployment, completely bypassed in local production mode. |
| `src/lib/database/SupabaseDatabaseProvider.ts` | Supabase cloud database provider | **Optional Cloud Extension** | Isolated behind `DatabaseFactory` (`CATALYST_DATABASE_MODE=sqlite` default). |
| `src/lib/storage/S3StorageProvider.ts` | AWS S3 cloud storage provider | **Optional Cloud Extension** | Isolated behind `StorageFactory` (`CATALYST_STORAGE_MODE=local` default). |
| `src/lib/audio/providers/synthesizer.ts` | Local 44.1kHz PCM tone synthesizer | **Dev / Test Offline Fallback** | Explicitly marked `isProductionReady: false`. Used strictly for testing when OpenAI key is omitted. |
| `src/app/api/post/route.ts` | Early prototype social post generator | **Legacy Prototype** | Documented, isolated from core Remotion pipeline. |
| `src/app/generate/page.tsx` | Early prototype manual video generator | **Legacy Prototype** | Maintained for UI backward compatibility. |
| `HyperFrames` / Python scripts | Legacy Python prototypes | **Zero Trace Found** | No Python dependencies or HyperFrames references exist in production runtime. |

---

## 3. Local-First Invariant Verification

1. **Zero AWS Dependency**: All render jobs execute via `@remotion/renderer` using headless local Chromium on Windows.
2. **Zero Supabase Dependency**: All project records, episodes, and render jobs persist in `./storage/catalyst.db` using Node.js native SQLite.
3. **Zero Python Dependency**: 100% TypeScript / Node.js runtime across all agents, validators, and renderers.
