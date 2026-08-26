# Campaign Engine & Content Calendar System

> **System:** Catalyst Campaign OS  
> **Persistence:** Local SQLite (`storage/catalyst.db`) & Supabase Hybrid  
> **Scheduling Range:** Full 30-Day Monthly Calendars

---

## 1. Campaign Data Structure

Each campaign functions as an independent content franchise with persistent brand rules, voice models, target audiences, and content pillars:

```typescript
export interface Campaign {
  id: string;
  name: string;                          // e.g. "Daily AI News", "Future Technology"
  niche: string;                         // e.g. "AI Research, Compute & Silicon"
  targetAudience: string;                // e.g. "Engineers, builders, tech leaders"
  contentGoal: string;                   // e.g. "Authoritative daily industry briefing"
  platforms: PlatformTarget[];           // youtube-shorts, tiktok, instagram-reels, x-video, linkedin
  publishingFrequency: 'daily' | 'weekdays' | 'tri-weekly';
  preferredDurationSeconds: number;      // e.g. 45 - 60s
  aspectRatios: ('9:16' | '16:9' | '1:1')[];
  tone: string;                          // e.g. "Investigative, empirical, broadcast-grade"
  editorialIdentity: EditorialIdentity;  // narrative pacing, complexity, citation standards
  visualIdentity: VisualIdentity;        // palettes, typography, texture, editorial marks
  narrationStyle: NarrationStyle;        // voice model, cadence, speed
  ctaStrategy: CTAStrategy;              // hook outro, handle, action prompt
  contentPillars: ContentPillar[];       // weighted content categories
  monthlyStrategy?: MonthlyStrategy;     // theme & weekly focus progressions
}
```

---

## 2. Monthly Content Calendar Architecture

The Monthly Calendar Generator automatically constructs an entire 30-day production calendar for any given month (e.g. September 2026):

```
+------------------------------------------------------------------------------------------------+
|                                    SEPTEMBER 2026 CALENDAR                                     |
+-------------------+--------------------+--------------------+--------------------+-------------+
| 01 Sep (Day 1)    | 02 Sep (Day 2)     | 03 Sep (Day 3)     | 04 Sep (Day 4)     | 05 Sep ...  |
| Topic: Strawberry | Topic: 2nm Silicon | Topic: Agent Swarm | Topic: Fusion Test | ...         |
| Status: DRAFT     | Status: DRAFT      | Status: DRAFT      | Status: DRAFT      | ...         |
| [OPEN WORKSPACE]  | [OPEN WORKSPACE]   | [OPEN WORKSPACE]   | [OPEN WORKSPACE]   | ...         |
+-------------------+--------------------+--------------------+--------------------+-------------+
```

### Calendar Episode Schema Fields
Each calendar date contains:
- `id`: Unique episode identifier (`ep_YYYYMMDD_xxx`).
- `date`: ISO Date (`2026-09-01`).
- `dayIndex`: Day of month (1 to 30/31).
- `topic`: Specific breaking or foundational subject.
- `title`: Broadcast-ready headline title.
- `hook`: High-retention narrative hook sentence.
- `contentPillar`: Assigned campaign pillar.
- `narrativeAngle`: Documentary / investigative perspective.
- `visualNoveltyScore`: Predicted novelty percentage (0–100%).
- `overallStatus`: `DRAFT` | `RESEARCHING` | `SCRIPT_READY` | `DESIGNING` | `PREVIEW` | `RENDERING` | `COMPLETED` | `PUBLISHED`.
- `scriptStatus`, `visualStatus`, `voiceStatus`, `renderStatus`, `publishingStatus`.

---

## 3. Interactive Workflow: Click Date -> Video Production

Clicking any calendar date opens the **Episode Workspace** (`/campaigns/[id]/episodes/[episodeId]`):
1. **Research Panel:** Automated web intelligence & fact extraction.
2. **Script & Storyboard Panel:** Multi-beat narrative scripting with word-level emphasis.
3. **Remotion Studio Viewport:** Real-time Remotion Player preview with interactive scrubber.
4. **Visual & Motion Inspector:** Direct control over 20+ visual languages, camera rigs, transitions, and 3D scenes.
5. **Automated QA & Auto-Repair:** 1-click diagnostic scan and correction patch applier.
6. **Production Export:** Local Chromium rendering generating broadcast MP4 video.
