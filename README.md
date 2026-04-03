<div align="center">
  <img src="https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/psychology/default/48px.svg" alt="NeuroBoost Logo" width="80" height="80">
  <h1 align="center">NeuroBoost HCI</h1>
  <p align="center">
    <strong>A Gamified Adaptive Interface for Cognitive Reflex and Attention Training</strong>
    <br />
    <i>Built alongside Human-Computer Interaction (HCI) research.</i>
  </p>
</div>

<hr/>

## 🧠 Overview
**NeuroBoost** is a full-stack, cloud-connected cognitive training platform designed to measure, adapt to, and analyze human cognitive performance methodologies. Developed specifically for HCI research, NeuroBoost translates traditional neurological assessments into modern, highly engaging gamified UI components.

It features a dynamically scaling **Adaptive Difficulty Engine** that reads a user's biological reaction time and accuracy to instantly mutate game variables—keeping the user in a state of psychological "Flow". Every interaction is securely stored in a scalable PostgreSQL cloud backend for deep statistical extraction.

---

## ⚡ Core Training Modules

NeuroBoost evaluates users via three isolated cognitive assessment modes:

1. **Reflex Mode (Processing Speed):**
   * *Inspiration:* Hick-Hyman Law & Simple Reaction Time Tasks.
   * *Mechanic:* Users must click rapidly vanishing targets. The engine natively records target spawn latency vs raw physical reaction time.
2. **Memory Mode (Working Memory Structure):**
   * *Inspiration:* Corsi Block-Tapping Test.
   * *Mechanic:* Users must successfully memorize and replicate an increasingly complex spatial sequence of lit nodes.
3. **Focus Mode (Spatial Attention & Distractor Filtering):**
   * *Inspiration:* Feature Integration Theory & Visual Search Tracking.
   * *Mechanic:* Identifying a target among an array of randomized, rotating distractors with dynamic color and shape similarities.

---

## 🛠️ Technology Stack
* **Frontend UI**: Next.js 15, React 19, Tailwind CSS
* **Backend / Database**: Supabase, PostgreSQL
* **Data Visualization**: Chart.js, react-chartjs-2
* **Authentication**: Supabase Auth (Row Level Security enabled)

---

## 🌩️ Cloud Architecture & HCI Data Logging

Data integrity is critical for HCI research. We bypassed standard simple metrics in favor of an **18-point HCI Metric schema**. The system logs session data via customized global React Context wrappers and commits deeply structured payloads to Postgres.

**Data points logged natively include:**
* `reaction_time_ms_avg`: Millisecond-perfect physical response averages.
* `accuracy_rate` & `error_rate`: Signal-detection theory proxies.
* `difficulty_progression_level`: Tracking how quickly a user breached skill caps.
* `memory_span_level`: Absolute numeric evaluation of working memory load capacity.

### Advanced RPC Analytics
Heavy computational analysis is offloaded from the browser. Using a custom deployed **Postgres RPC Function** (`get_user_analytics`), the database natively queries, filters, and averages thousands of historical session variables recursively before feeding pristine aggregated JSON straight into the React dashboard.

---

## 🚀 Getting Started

To run this laboratory architecture locally for independent testing or UI modifications, follow these steps:

### 1. Clone & Install
```bash
git clone https://github.com/your-username/neuro-boost.git
cd neuro-boost
npm install
```

### 2. Configure Environment Variables
Create a file named `.env.local` in the root of your project directory, and link it to your dedicated Supabase instance keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

### 3. Initialize the Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

---

## 📖 Research Paper Integration
If you are observing this codebase as a companion piece to the core research publication, you will notice:
* **The "Zero Drop-Off" Approach:** User progress is never lost. The application uses a hybrid sync protocol. If a user tries an assessment anonymously, data is committed strictly to browser `localStorage`. Upon logging in, the `AuthSyncWrapper` natively maps and transfers the local data payload to the Cloud, guaranteeing uncompromised user data continuity.
* **Algorithm Honesty:** The difficulty scaling logic (located in `/app/lib/adaptiveEngine.ts`) never imposes artificial ceilings. Difficulty is mathematically derived entirely from the biological interactions recorded during the preceding session tick.

---
*Created as part of an iterative exploration into digital cognitive interaction and user-interface friction.*
