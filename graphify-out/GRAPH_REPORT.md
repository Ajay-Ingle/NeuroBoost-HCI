# Graph Report - .  (2026-04-17)

## Corpus Check
- 16 files · ~9,198 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 34 nodes · 27 edges · 14 communities detected
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `AdaptiveEngine` - 4 edges
2. `usePerformance()` - 4 edges
3. `FocusMode()` - 3 edges
4. `startNextRound()` - 3 edges
5. `handleRoundEnd()` - 3 edges
6. `ReflexMode()` - 3 edges
7. `Home()` - 2 edges
8. `playSequence()` - 2 edges
9. `handleTileClick()` - 2 edges
10. `startGame()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `FocusMode()` --calls--> `usePerformance()`  [INFERRED]
  app\training\components\FocusMode.tsx → app\lib\PerformanceContext.tsx
- `ReflexMode()` --calls--> `usePerformance()`  [INFERRED]
  app\training\components\ReflexMode.tsx → app\lib\PerformanceContext.tsx
- `Home()` --calls--> `usePerformance()`  [INFERRED]
  app\page.tsx → app\lib\PerformanceContext.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.33
Nodes (3): AdaptiveEngine, handleRoundEnd(), handleTileClick()

### Community 1 - "Community 1"
Cohesion: 0.4
Nodes (2): Home(), usePerformance()

### Community 2 - "Community 2"
Cohesion: 0.6
Nodes (3): playSequence(), startGame(), startNextRound()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (2): FocusMode(), ReflexMode()

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 4`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `AuthModal.tsx`, `handleAuth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (2 nodes): `AuthContext.tsx`, `AuthProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `supabaseClient.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AdaptiveEngine` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `handleRoundEnd()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `usePerformance()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `usePerformance()` (e.g. with `Home()` and `FocusMode()`) actually correct?**
  _`usePerformance()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `FocusMode()` (e.g. with `usePerformance()` and `.getInitialSettings()`) actually correct?**
  _`FocusMode()` has 2 INFERRED edges - model-reasoned connections that need verification._