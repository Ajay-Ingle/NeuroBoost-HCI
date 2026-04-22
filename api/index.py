from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import os
import json
from typing import List, Optional
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load local environment variables (When on Vercel, it uses Vercel Environment variables automatically)
load_dotenv(".env.local")

app = FastAPI()

# Securely initialize Supabase DB Bridge
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

class PatientRequest(BaseModel):
    user_id: str
    limit: int = 5

@app.get("/api/health")
def health_check():
    return {"status": "success", "message": "NeuroBoost AI Engine is online on Vercel Serverless!"}

@app.post("/api/diagnose")
def generate_clinical_insight(req: PatientRequest, request: Request):
    auth_header = request.headers.get("Authorization")
    
    # Phase 2: Secure Data Ingestion Pipeline
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase keys missing. Check .env.local or Vercel Environment.")
        
    try:
        # Initialize client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Extract Bearer token and bind it to the Postgrest client to respect RLS
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            supabase.postgrest.auth(token)
            print(f"DEBUG: Bound JWT to Postgrest context for user: {req.user_id}")
        
        # 1. Fetch the Patient's Medical Profile
        profile_response = supabase.table('profiles').select('*').eq('id', req.user_id).execute()
        patient_profile = profile_response.data[0] if profile_response.data else {}
        print(f"DEBUG: Profile found: {bool(patient_profile)}")

        # 2. Extract the user's historical clinical logs
        response = supabase.table('session_logs').select(
            'session_date, mode, effectiveness_score, learnability_score, performance_stability_variance, adaptation_accuracy_score, attention_stability_score'
        ).eq('user_id', req.user_id).order('session_date', desc=True).limit(req.limit).execute()
        
        telemetry_logs = response.data
        print(f"DEBUG: Found {len(telemetry_logs)} logs in Supabase for user.")
        
        if not telemetry_logs:
            return {
                "status": "success",
                "ai_report": f"Insufficient behavioral data to generate a reliable AI diagnostic for user {req.user_id}. Please complete at least 3 clinical trials."
            }
            
        # ==========================================================
        # PHASE 3: The "Context Builder" (MCP Analytics Isolation)
        # We process the raw Database JSON into strict medical statistics
        # ==========================================================
        total_sessions = len(telemetry_logs)
        average_panic_score = sum([log.get('adaptation_accuracy_score', 0) for log in telemetry_logs if log.get('adaptation_accuracy_score') is not None]) / total_sessions
        average_fatigue_variance = sum([log.get('performance_stability_variance', 0) for log in telemetry_logs if log.get('performance_stability_variance') is not None]) / total_sessions
        
        # Build the protected JSON Context Block (Now injected with Demographic data)
        patient_mcp_context = {
            "patient_demographics": {
                "age": patient_profile.get("age", "Unknown"),
                "primary_cohort": patient_profile.get("primary_cohort", "Unknown"),
                "medical_conditions": patient_profile.get("medical_conditions", []),
                "sleep_average_hours": patient_profile.get("sleep_average_hours", "Unknown"),
                "baseline_notes": patient_profile.get("baseline_notes", "None")
            },
            "cognitive_trends": {
                "recent_trials_analyzed": total_sessions,
                "panic_resistance_avg_percentage": round(average_panic_score, 2),
                "fatigue_variance_avg": round(average_fatigue_variance, 2)
            },
            "raw_recent_history": telemetry_logs[:3] # Supply only the 3 most recent exact matches to prevent token bloat
        }
        
        # ==========================================================
        # PHASE 4: The Generative AI Orchestrator (Google Gemini)
        # ==========================================================
        # Prioritize Google Gemini but keep OpenAI as fallback
        # On Vercel, these are read from the Dashboard Environment Variables
        GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
        OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

        if not GOOGLE_API_KEY and not OPENAI_API_KEY:
            # Simulated fallback if no keys are found
            simulated_response = f"Simulated AI Insight: Processing {total_sessions} clinical sessions. The patient's panic resistance is currently mapped at 33.33%. To activate the full LLM Clinical analysis, please set GOOGLE_API_KEY in the Vercel Dashboard."
            return {
                "status": "success",
                "extracted_sessions_count": total_sessions,
                "ai_report": simulated_response
            }
            
        # ==========================================================
        # MULTI-MODAL AI ENGINE (Gemini 2.0 with GPT-4 Fallback)
        # ==========================================================
        if GOOGLE_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=GOOGLE_API_KEY)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            system_instruction = """
            You are an elite Neurological AI Diagnostic Agent. 
            Analyze mathematical telemetry context from a patient's clinical cognitive test.
            Consider demographics: age, medical conditions, and sleep patterns.
            Output professional, medical-grade behavioral therapy insights. Maximum 3 sentences. 
            Be absolutely specific to the quantitative data provided.
            """
            
            prompt = f"{system_instruction}\n\nPatient Telemetry Payload:\n{json.dumps(patient_mcp_context)}"
            response = model.generate_content(prompt)
            ai_report = response.text
            print("DEBUG: Successfully generated insight via Gemini 2.0 Flash")
            
        elif OPENAI_API_KEY:
            from langchain_openai import ChatOpenAI
            from langchain.schema import SystemMessage, HumanMessage
            llm = ChatOpenAI(temperature=0.2, model="gpt-4o", api_key=OPENAI_API_KEY)
            
            messages = [
                SystemMessage(content="You are an elite Neurological AI Diagnostic Agent. Analyze telemetry and demographics for clinical insights. Max 3 sentences."),
                HumanMessage(content=f"Context: {json.dumps(patient_mcp_context)}")
            ]
            ai_report = llm.invoke(messages).content
            print("DEBUG: Successfully generated insight via OpenAI GPT-4o")
        else:
            ai_report = "Error: No AI API keys configured (Missing GOOGLE_API_KEY or OPENAI_API_KEY)."

        return {
            "status": "success",
            "extracted_sessions_count": total_sessions,
            "ai_report": ai_report
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL ERROR: {error_msg}")
        # Return a status: success but with the error in the ai_report so the UI can show it
        return {
            "status": "success", 
            "ai_report": f"AI Engine Error: {error_msg}. Please check if your API Key has Gemini permissions."
        }
