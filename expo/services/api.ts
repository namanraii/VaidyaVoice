/** API service for VaidyaVoice backend communication. */
const API_BASE_URL = 'http://localhost:8001'; // For local testing

export interface TriageRequest {
  audio_b64: string;
  session_id: string;
  language: string;
  current_medicines?: string[];
  location?: { latitude: number; longitude: number };
}

export interface TriageResponse {
  transcript: string;
  extracted_symptoms: string[];
  ranked_conditions: any[];
  top_condition: string;
  triage_level: 'green' | 'yellow' | 'red';
  is_emergency: boolean;
  drug_interactions: any[];
  advice_text: string;
  audio_response_b64: string;
  hospital_needed: boolean;
  reasoning_path: any;
  session_id: string;
}

export async function triageFromAudio(request: TriageRequest): Promise<TriageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/triage/audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Triage failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function triageFromText(text: string, sessionId: string, language: string): Promise<TriageResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/triage/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_b64: text,
      session_id: sessionId,
      language,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Text triage failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function healthCheck(): Promise<{ status: string; neo4j_connected: boolean }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
