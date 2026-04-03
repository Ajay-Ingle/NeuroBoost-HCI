---
name: BackendIntegrator
description: Contains the schema logic and structural paradigm for NeuroBoost's Supabase backend. Follow this when bridging the Next.js UI to the PostgreSQL database.
---

# NeuroBoost Backend Integration & Schema Logic

This document specifies the exact database structure and data synchronization logic for NeuroBoost's integration with Supabase.

## 1. Authentication & Profiling
- **Auth Provider**: Standard Email / Password system via Supabase Auth.
- **`profiles` Table**:
  - Automatically linked to `auth.users`.
  - **Required Medical/Cognitive Fields**:
    - `age` (integer)
    - `medical_conditions` (text array/jsonb) - for detecting specific brain or cognitive impairments.
    - `baseline_notes` (text)

## 2. Session Logs (`session_logs` Table)
To optimize memory usage, the system converts granular, per-click tracking generated during active gameplay into highly efficient **Summary Statistics**.

**Performance Metrics (Core System)**
- `reaction_time_ms_avg` (integer): Average time to respond to a stimulus.
- `accuracy_rate` (numeric): Percentage of correct responses.
- `error_rate` (numeric): Percentage of incorrect responses.
- `completion_time_seconds` (integer): Time taken to complete the level.
- `memory_span_level` (integer): Max sequence length recalled (Memory Mode).

**Cognitive Metrics (HCI Evaluation)**
- `cognitive_load_perceived` (varchar): 'Low', 'Medium', 'High' based on survey.
- `attention_stability_score` (numeric): Derived from missed targets.
- `learning_improvement_rate` (numeric): Computed difference against historical average.

**Usability Metrics**
- `efficiency_score` (numeric): Derived from completion & reaction time.
- `effectiveness_score` (numeric): Derived from accuracy.
- `user_satisfaction` (integer): 1-5 rating on enjoyment.
- `learnability_score` (numeric): Calculated via first-time mistake ratio.

**Engagement & Adaptive Metrics**
- `session_duration_seconds` (integer)
- `task_repetition_count` (integer)
- `drop_off_flag` (boolean)
- `adaptation_accuracy_score` (numeric): Rating of how well the engine adapted.
- `difficulty_progression_level` (integer): Current raw level integer.
- `performance_stability_variance` (numeric): Statistical variance tracker.

## 3. Adaptive Engine Persistence (`user_stats` Table)
- Persistently stores state variables.
- Contains dynamic properties (e.g., `current_reflex_spawn_rate`, `current_memory_sequence`) so the player resumes immediately at their precise tuned difficulty level upon logging in on any device.

## 4. Data Synchronization (Local -> Cloud)
- **Strategy**: When an anonymous user registers, the frontend extracts all records from `localStorage`.
- All extracted records are bundled and pushed to the `session_logs` table via a bulk insert.
- The `localStorage` is then cleared to prevent duplicate syncing, transferring total source-of-truth ownership to the cloud.

## 5. Postgres Aggregation (RPC Functions)
- **Direct Database Computation**: To maximize frontend rendering speed for the Analytics dashboard `Chart.js` components, complex data calculations (weekly averages, historical trend slopes) are processed directly in the database.
- Uses **RPC (Remote Procedure Calls)** like `get_weekly_performance_trends()` to return perfectly formatted JSON directly consumable by the charts.
