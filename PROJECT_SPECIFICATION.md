# NeuroBoost-HCI: Technical Project Specification

## 1. Project Overview
**NeuroBoost-HCI** is a high-fidelity, research-oriented cognitive training platform. It bridges the gap between **Human-Computer Interaction (HCI)** and **Neurological Assessment** by translating traditional cognitive tests into a gamified, cloud-connected ecosystem. The system is designed to measure, analyze, and improve cognitive processing speed, working memory, and selective attention through real-time adaptive feedback loops.

---

## 2. Core Training Modules (Assessment Engine)
The platform evaluates users through three distinct, scientifically-grounded training modes:

*   **Reflex Mode (Processing Speed):**
    *   **Scientific Basis:** Hick-Hyman Law.
    *   **Mechanic:** Dynamic target acquisition with randomized spawn latencies.
    *   **Metrics:** Measures raw physical reaction time vs. stimulus appearance.
*   **Memory Mode (Spatial Working Memory):**
    *   **Scientific Basis:** Corsi Block-Tapping Test.
    *   **Mechanic:** Sequential spatial node memorization and replication.
    *   **Metrics:** Tracks memory span level and sequence accuracy progression.
*   **Focus Mode (Selective Attention):**
    *   **Scientific Basis:** Feature Integration Theory & Visual Search.
    *   **Mechanic:** Target identification within an array of rotating, randomized distractors.
    *   **Metrics:** Measures distractor filtering efficiency and search latency.

---

## 3. The Adaptive Difficulty Engine (ADE)
The "heart" of the project is a mathematical scaling algorithm that maintains the user in a psychological **"Flow State."**
*   **Real-time Mutation:** The engine analyzes Accuracy and Latency mid-session.
*   **Dynamic Variables:** Automatically adjusts target speed, sequence length, and distractor density based on the user's biological interaction speed.
*   **Zero-Ceiling Logic:** Difficulty is mathematically derived from the preceding session tick, ensuring the training remains challenging as the user improves.

---

## 4. 18-Point HCI Metric Schema
Unlike basic apps that only track "scores," NeuroBoost logs 18 distinct clinical data points for deep statistical analysis:
1.  `reaction_time_ms_avg`: Millisecond-perfect response tracking.
2.  `accuracy_rate`: Signal detection proxy under variable cognitive load.
3.  `completion_time_seconds`: Processing speed index.
4.  `error_rate`: Calculated percentage of failed interactions.
5.  `efficiency_score`: Output density relative to time and accuracy.
6.  `performance_stability_variance`: Consistency of cognitive output (Standard Deviation of RTs).
7.  `attention_stability_score`: Attention decay over time (Fatigue Metric).
8.  `drop_off_flag`: Indicates premature session termination.
9.  `learning_improvement_rate`: Historical context analysis against past performance.
10. `effectiveness_score`: Accuracy weighted by difficulty payload.
11. `learnability_score`: Rate of skill acquisition over time (Slope of initial interactions).
12. `adaptation_accuracy_score`: Panic resistance in late-stage adaptive difficulty.
13. `memory_span_level`: Specific peak level reached in memory cognitive tasks.
14. `difficulty_progression_level`: The highest adaptive difficulty tier achieved.
15. `cognitive_load_perceived`: User's subjective rating of mental effort.
16. `user_satisfaction`: Subjective engagement and satisfaction score.
17. `mode`: The specific cognitive module evaluated (Reflex, Memory, Focus).
18. `session_date`: Temporal marker for longitudinal trend analysis.

---

## 5. Advanced Features: Gen AI Diagnostics
As a production-ready extension, the platform integrates an AI Clinical Reasoning layer:
*   **Google Gemini 1.5/2.0 Integration:** A direct-API microservice (FastAPI) that processes raw telemetry.
*   **Clinical Narrative:** The AI merges performance metrics with patient demographics (age, medical history, sleep patterns) to generate professional behavioral therapy insights.
*   **Self-Healing Error Bridge:** Robust handling for API quotas and connectivity, ensuring the dashboard always remains functional.

---

## 6. Detailed Technology Stack
### Frontend (The Interface)
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript (Strict Mode)
*   **UI/Styling:** Tailwind CSS + Glassmorphism Design System
*   **Visuals:** Chart.js & React-Chartjs-2 for real-time telemetry visualization.

### Backend (The Infrastructure)
*   **Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth with Row-Level Security (RLS).
*   **Serverless Logic:** Postgres RPC (Remote Procedure Calls) for heavy data aggregation.

### AI & Microservices
*   **Language:** Python 3.12 (FastAPI)
*   **LLM SDK:** `google-generativeai` (Direct Drive logic)
*   **Deployment:** Vercel (Edge Functions & Serverless).

---

## 7. Data Integrity & Security
*   **Hybrid Sync Protocol:** Anonymous session data is stored in `localStorage` and automatically mapped to the Cloud profile upon authentication, preventing data loss.
*   **JWT Security:** The Python AI engine uses the user's Supabase JWT to impersonate the user securely, ensuring strict adherence to database privacy rules.
*   **Numeric Overflow Protection:** Custom sanitization logic in the telemetry pipeline to ensure all high-precision data fits PostgreSQL constraints.

---

## 8. Conclusion
**NeuroBoost-HCI** represents a state-of-the-art implementation of adaptive cognitive training. By combining real-time algorithmic scaling with high-fidelity logging and Gen AI insights, it serves as a powerful tool for both clinical research and personal cognitive development.
