# Graph Report - .  (2026-05-13)

## Corpus Check
- Corpus is ~14,902 words - fits in a single context window. You may not need a graph.

## Summary
- 54 nodes · 40 edges · 20 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Memory Mode|Memory Mode]]
- [[_COMMUNITY_Adaptive Engine & Reflex|Adaptive Engine & Reflex]]
- [[_COMMUNITY_Focus Mode|Focus Mode]]
- [[_COMMUNITY_FastAPI Backend|FastAPI Backend]]
- [[_COMMUNITY_User Profile|User Profile]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Analytics Dashboard|Analytics Dashboard]]
- [[_COMMUNITY_MCP API Route|MCP API Route]]
- [[_COMMUNITY_Clinical Assistant UI|Clinical Assistant UI]]
- [[_COMMUNITY_Authentication Modal|Authentication Modal]]
- [[_COMMUNITY_Auth Context|Auth Context]]
- [[_COMMUNITY_Survey Overlay|Survey Overlay]]
- [[_COMMUNITY_Model Scripts|Model Scripts]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Environment|Next.js Environment]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Landing Page|Landing Page]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Training Page|Training Page]]

## God Nodes (most connected - your core abstractions)
1. `AdaptiveEngine` - 4 edges
2. `generateBoard()` - 3 edges
3. `startNextRound()` - 3 edges
4. `handleRoundEnd()` - 3 edges
5. `ReflexMode()` - 3 edges
6. `PatientRequest` - 2 edges
7. `usePerformance()` - 2 edges
8. `handleItemClick()` - 2 edges
9. `startGame()` - 2 edges
10. `playSequence()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `ReflexMode()` --calls--> `usePerformance()`  [INFERRED]
  app\training\components\ReflexMode.tsx → app\lib\PerformanceContext.tsx

## Communities

### Community 0 - "Memory Mode"
Cohesion: 0.31
Nodes (5): handleRoundEnd(), handleTileClick(), playSequence(), startGame(), startNextRound()

### Community 1 - "Adaptive Engine & Reflex"
Cohesion: 0.22
Nodes (3): AdaptiveEngine, usePerformance(), ReflexMode()

### Community 2 - "Focus Mode"
Cohesion: 0.47
Nodes (3): generateBoard(), handleItemClick(), startGame()

### Community 3 - "FastAPI Backend"
Cohesion: 0.4
Nodes (2): BaseModel, PatientRequest

### Community 4 - "User Profile"
Cohesion: 0.67
Nodes (0): 

### Community 5 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Analytics Dashboard"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "MCP API Route"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Clinical Assistant UI"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Authentication Modal"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Auth Context"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Survey Overlay"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Model Scripts"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Next.js Environment"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Landing Page"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Training Page"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Root Layout`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Analytics Dashboard`** (2 nodes): `page.tsx`, `generateAiClinicalInsight()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MCP API Route`** (2 nodes): `route.ts`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clinical Assistant UI`** (2 nodes): `page.tsx`, `ClinicalAssistant()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Authentication Modal`** (2 nodes): `AuthModal.tsx`, `handleAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Context`** (2 nodes): `AuthContext.tsx`, `AuthProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Survey Overlay`** (2 nodes): `SurveyOverlay.tsx`, `handleSubmit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Model Scripts`** (1 nodes): `check_models.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Environment`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabaseClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Training Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AdaptiveEngine` connect `Adaptive Engine & Reflex` to `Memory Mode`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `ReflexMode()` (e.g. with `usePerformance()` and `.getInitialSettings()`) actually correct?**
  _`ReflexMode()` has 2 INFERRED edges - model-reasoned connections that need verification._