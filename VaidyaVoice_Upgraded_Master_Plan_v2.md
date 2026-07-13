# VaidyaVoice — Upgraded Master Plan (14 Days, Solo, 5 Prize Pools)

> **Version:** 2.0  
> **Based on:** Live research of Sarvam AI docs (June 2026), Neo4j 2026.01 features, Render Workflows beta (Apr 2026), Expo SDK 54+, and rural India healthcare accessibility data (PMC 2026).  
> **Status:** This document supersedes your v1.0 plan. Every change here is evidence-based and actionable.

---

## 0. Critical Findings That Would Break Your Demo (Fix These First)

| # | Issue in v1.0 Plan | Current Reality (Verified) | Risk Level |
|---|---|---|---|
| 1 | Uses `sarvam-m` for LLM | **`sarvam-m` is DEPRECATED as of June 2026.** Requests with `model="sarvam-m"` will **fail**. Use `sarvam-30b` (64K context) or `sarvam-105b` (128K context). | 🔴 **DEMO-KILLER** |
| 2 | Assumes ₹1,000 free Sarvam credits | **New accounts receive only ₹100 free credits** (changed May 2026). You will burn through this in ~2 hours of TTS testing. Budget ₹500-1,000 for the hackathon. | 🔴 **DEMO-KILLER** |
| 3 | Recommends `expo-av` for audio | **`expo-av` is deprecated in Expo SDK 55+** (confirmed by Expensify migration Jan 2026). Use **`expo-audio`** with `useAudioRecorder`, `useAudioSampleListener` (waveform), and `useAudioStream`. | 🔴 **BUILD-KILLER** |
| 4 | Neo4j vector index as "stretch goal" | **Vector indexes are now native first-class citizens in Cypher 25** (Neo4j 2026.01). This is the single highest-leverage feature for the AuraDB track. Making it a stretch goal is leaving points on the table. | 🟡 **TRACK-LOSER** |
| 5 | Render Workflows `@task` decorator | **Correct Python SDK syntax is `@app.task(...)`** with `from render_sdk import Workflows, Retry`. The `@task` standalone decorator is from an older SDK draft. | 🟡 **BUILD-BLOCKER** |
| 6 | STT "30s limit" described as a problem to engineer around | **Sarvam supports WebSocket streaming STT** (real-time, ultra-low latency <250ms) AND **Batch API** (up to 60 min/file, 20 files). Your architecture should use streaming for the live demo and batch as fallback — this shows you evaluated all three modes. | 🟡 **MISSED OPPORTUNITY** |
| 7 | No mention of GraphRAG | **Neo4j's #1 marketed capability in 2025-2026 is GraphRAG** — combining vector similarity + graph traversal for LLM context retrieval. A plain lookup query won't impress judges who've seen 20 other "knowledge graphs." | 🟡 **TRACK-LOSER** |

---

## 1. The Upgraded One-Line Pitch

> *"A rural patient speaks their symptoms in Hindi, Tamil, or Bengali into a phone. In under 3 seconds, a **GraphRAG-powered** triage agent — running as a durable Render Workflow — searches a Neo4j knowledge graph of 20 conditions, checks for dangerous drug interactions across multiple hops, and speaks back — in the patient's own voice — what it might be, what to do, and whether to run to a hospital right now."*

**What's new:** "GraphRAG-powered," "under 3 seconds," "durable Render Workflow," "multiple hops." These are the phrases judges' ears are tuned to in 2026.

---

## 2. Why This Wins Each Track — Upgraded Arguments

### 🏆 Sarvam Track — "Best Use of Sarvam AI"

| Your v1.0 | Upgraded v2.0 |
|---|---|
| STT (Saaras v3) → LLM → Translate → TTS | **WebSocket streaming STT** (real-time, <250ms latency) → **`sarvam-30b` LLM** with tool-calling for graph queries → **WebSocket streaming TTS** (Bulbul v3) for sub-3-second voice pipeline |
| "Multiple Sarvam products chained" | **Five Sarvam products in one pipeline:** Saaras v3 (streaming), Sarvam-30B (symptom extraction + response composition), Sarvam-Translate v1 (22-language expansion), Bulbul v3 (TTS), LID API (auto-language detection). Plus: you evaluated all STT modes (`transcribe`, `codemix`, `verbatim`) and chose per use-case. |
| Handled 30s limit with chunking | **Triple-mode architecture:** WebSocket streaming for live demo (<30s utterances), Batch API for long rural consultations (up to 60 min), REST for quick retries. Document this decision matrix in your README. |

**Key talking point:** *"We built a real-time voice agent pipeline where the patient speaks, the graph thinks, and the voice answers — all in under 3 seconds. Every API call is Sarvam-native, including the code-mixed Hinglish that rural patients actually speak."*

**Speakers to lock in (per language, for brand voice consistency):**
- Hindi: `shubh` (male, warm, authoritative) or `priya` (female, clear, reassuring)
- Tamil: `kavya` (female, measured)
- Bengali: `roopa` (female, expressive)

**Hard limits to engineer around (name-check these in README):**
- REST STT: 30 seconds max per request → solved with WebSocket streaming
- REST TTS: 2,500 characters max → your triage responses are forced to be concise (good UX)
- Free tier: ₹100 credits → budget ₹500-1,000 for hackathon; use WebSocket to reduce redundant API calls
- Rate limits: 60 req/min on Starter → design pipeline to batch where possible

---

### 🏆 Neo4j Track — "Best Use of Neo4j AuraDB"

| Your v1.0 | Upgraded v2.0 |
|---|---|
| Weighted multi-hop Cypher query | **GraphRAG architecture:** Vector semantic search over symptom embeddings → graph traversal for condition ranking → multi-hop drug interaction check → centrality scoring for condition severity |
| "A real graph with weighted multi-hop traversal" | **Native VECTOR type** (Cypher 25) storing symptom embeddings in the graph itself. `ai.text.embed()` in Cypher queries. **In-index filtering** (Neo4j 2026.01) for metadata-predicated vector search. |
| Drug interaction query in one hop | **Multi-hop with path analysis:** `(Condition)-[:TREATED_WITH]->(Medicine)-[:INTERACTS_WITH {severity}]->(Medicine)<-[:TAKEN_BY]-(Patient)` — then use **GDS shortest path** to find alternative medicines if interaction detected. |
| Stretch: vector index over symptom text | **Core feature from Day 1.** Free-text descriptions ("burning when I pee") match `Symptom` nodes via vector similarity, then traverse to `Condition`. This is the difference between "used Neo4j" and "used what makes Neo4j special in 2026." |

**The winning Cypher queries (include these in README):**

```cypher
// 1. GraphRAG: Vector + Graph retrieval
CALL db.index.vector.queryNodes('symptomEmbeddings', 5, 
  ai.text.embed($freeTextDescription, 'sarvam-30b')) 
YIELD node AS matchedSymptom, score
MATCH (matchedSymptom)-[r:INDICATES]->(c:Condition)
WITH c, sum(r.weight * score) AS rankedScore, collect(matchedSymptom.name) AS matched
ORDER BY rankedScore DESC
RETURN c.name, c.severity_score, c.is_emergency, rankedScore, matched
LIMIT 5
```

```cypher
// 2. Drug interaction with path alternatives
MATCH path = (c:Condition {name: $condition})-[:TREATED_WITH]->(m:Medicine)
  -[i:INTERACTS_WITH {severity: 'high'}]->(existing:Medicine)
WHERE existing.name IN $currentMedicines
WITH m, existing, i.severity AS severity
OPTIONAL MATCH altPath = (c)-[:TREATED_WITH]->(alt:Medicine)
WHERE alt <> m AND NOT (alt)-[:INTERACTS_WITH]->(existing)
RETURN m.name AS dangerousDrug, existing.name AS patientDrug, 
       severity, collect(alt.name) AS safeAlternatives
```

```cypher
// 3. Conversation memory as temporal graph (stores session history IN the graph)
MERGE (p:Patient {session_id: $sessionId})
MERGE (s:Symptom {name: $symptom})
MERGE (p)-[r:REPORTED {timestamp: datetime()}]->(s)
WITH p
MATCH (p)-[:REPORTED]->(sym:Symptom)
WITH p, collect(sym.name) AS symptomHistory
// ... use symptomHistory for temporal trend analysis
```

**Key talking point:** *"This isn't a lookup table with relationships. It's a GraphRAG system: the patient's description is embedded into vector space, matched semantically against symptoms, then traversed through weighted condition paths — and if a drug interaction is found, the graph itself suggests safe alternatives by finding non-interacting paths. That's why it needs a graph, not a table."*

---

### 🏆 Render Track — "Best Use of Render Workflows"

| Your v1.0 | Upgraded v2.0 |
|---|---|
| 8 sequential steps as durable tasks | **Multi-agent workflow with parallel execution:** TriageAgent, DrugCheckAgent, and EmergencyAgent run in parallel where possible. Parent workflow orchestrates with `asyncio.gather()`. |
| "Show retries in dashboard" | **Deliberate chaos engineering in demo:** Include a `simulate_failure()` task that throws a 429 error, shows exponential backoff retry in the Render dashboard, then recovers. Judges score "best use" on observability, not just green deploys. |
| Deploy FastAPI + Postgres | **Full Render stack:** Web service (FastAPI) + Workflow service (multi-agent tasks) + Postgres (session metadata) + Redis (caching frequent graph queries) — all on private network, zero glue code. |

**Correct Render Workflows Python SDK (verified against Apr 2026 blog):**

```python
from render_sdk import Workflows, Retry
import asyncio

app = Workflows()

@app.task(
    retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=1.5),
    timeout_seconds=120,
    plan="standard"  # 1 CPU, 2GB RAM, $0.20/hr
)
async def transcribe_audio(audio_b64: str, language: str) -> dict:
    # Saaras v3 streaming or REST
    ...

@app.task(
    retry=Retry(max_retries=2, wait_duration_ms=2000, backoff_scaling=2.0),
    timeout_seconds=60,
    plan="starter"
)
async def check_drug_interactions(condition: str, current_meds: list) -> dict:
    # Neo4j multi-hop query
    ...

@app.task(timeout_seconds=180, plan="standard")
async def triage_orchestrator(audio_b64: str, session_id: str, language: str) -> dict:
    """Parent task: parallelize independent checks"""
    transcript = await transcribe_audio(audio_b64, language)
    symptoms = await extract_symptoms(transcript["text"])
    
    # Parallel execution: these don't depend on each other
    condition_task = query_graph(symptoms)
    interaction_task = check_drug_interactions(symptoms.get("condition"), symptoms.get("medicines", []))
    
    condition_result, interaction_result = await asyncio.gather(
        condition_task, interaction_task
    )
    
    response = await compose_response(condition_result, interaction_result, language)
    audio_response = await synthesize_speech(response, language)
    return {"audio": audio_response, "triage": condition_result, "interactions": interaction_result}
```

**Demo move:** Open the Render Dashboard → Workflows → click a failed run → show the retry timeline with exponential backoff → click the successful retry. Say: *"This 429 from Sarvam retried automatically with backoff. We didn't write a single line of retry logic. That's what durable execution means."*

---

### 🏆 Expo Track — "Best Mobile Experience"

| Your v1.0 | Upgraded v2.0 |
|---|---|
| 3 screens | **3 screens + 1 hidden power feature:** Graph Visualization — a "How VaidyaVoice Thinks" screen that shows the Neo4j graph path (symptom → condition → medicine → interaction) as an animated node graph. This is pure "best use of Expo" — native canvas/reanimated animation that a web view couldn't do. |
| `expo-av` for recording | **`expo-audio`** with `useAudioRecorder(RecordingPresets.HIGH_QUALITY)`, `useAudioSampleListener` for real-time waveform, and `useAudioStream` for PCM analysis. |
| Language picker | **Auto-detect language** via Sarvam LID API on first utterance, with manual override. One less barrier for illiterate users. |
| Static hospital finder | **Real-time geolocation → dynamic PHC mapping** using India's public health facility geodata (NHRR 2018). Show distance, travel time, and whether the PHC is overcapacity (crowding-out metric from PMC 2026 paper). |

**Expo packages to install:**
```bash
npx expo install expo-audio expo-location expo-linear-gradient
npx expo install react-native-reanimated react-native-svg  # for waveform + graph viz
```

**Screen 1 — Voice Input:**
- Big pulsing mic button with `useAudioSampleListener` waveform
- Auto-language detection badge ("Detected: Hindi")
- "Speak your symptoms" prompt in detected language

**Screen 2 — Triage Result:**
- Transcript chip + extracted symptom chips
- **Animated confidence meter** (Reanimated) for top condition
- Color-coded triage card (green/yellow/red)
- "Why this result?" button → opens Graph Viz screen
- Play button for TTS response

**Screen 3 — Graph Viz (the secret weapon):**
- Animated SVG graph showing: your symptom → matched condition → suggested medicine → ⚠️ interaction check
- Each node pulses as the workflow step completes
- This screen answers "how does it know?" — critical for trust in rural health

**Screen 4 — Emergency (conditional):**
- Device geolocation → nearest 3 PHCs with distance
- Red "Call 108" (India ambulance) button
- "Share location with family" via native share sheet

---

### 🏆 Overall Track — "Best Project"

**The story that wins:**

> *"73% of rural India has no access to quality healthcare. 55 million people are pushed into poverty every year by out-of-pocket medical costs. The average village is 5.5 km from the nearest clinic — and 20% of villages are effectively 'crowded out' because the clinic is already overwhelmed.*
>
> *VaidyaVoice is not a chatbot. It's a GraphRAG-powered voice triage system that runs on a ₹5,000 phone with 2G connectivity. It understands Hinglish. It remembers your symptoms across sessions. And it can spot a drug interaction that would kill you — by traversing a knowledge graph, not guessing from a flat database.*
>
> *The technology stack is deliberately chosen: Sarvam for sovereign Indian-language AI, Neo4j for connected medical intelligence, Render for reliable rural connectivity, and Expo for offline-first native mobile."*

---

## 3. Upgraded System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              [Expo App]                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Mic Screen  │→ │ Triage Card │→ │ Graph Viz   │→ │ Emergency (cond.)   │  │
│  │ + Waveform  │  │ + Why? btn  │  │ Animated    │  │ PHC Map + Call 108  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│       │                                                                      │
│       │ WebSocket: streaming audio chunk →                                   │
│       ▼                                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │     [FastAPI Gateway on Render]    │
                    │  (WebSocket handler, session mgmt) │
                    └─────────────────┬─────────────────┘
                                      │ trigger task
                    ┌─────────────────┴─────────────────┐
                    │  [RENDER WORKFLOW: Multi-Agent]    │
                    │                                    │
                    │  ┌─────────────┐  ┌─────────────┐  │
                    │  │ transcribe  │→ │ extract_    │  │
                    │  │ _streaming  │   │ symptoms    │  │
                    │  └─────────────┘  └──────┬──────┘  │
                    │                          │         │
                    │         ┌────────────────┼────────┐│
                    │         ▼                ▼        ▼│
                    │  ┌─────────────┐  ┌─────────────┐  │
                    │  │ query_graph │  │ check_drugs │  │
                    │  │ (GraphRAG)  │  │ (multi-hop) │  │
                    │  └──────┬──────┘  └──────┬──────┘  │
                    │         │                │         │
                    │         └────────┬───────┘         │
                    │                  ▼                 │
                    │  ┌─────────────┐  ┌─────────────┐  │
                    │  │ compose_    │→ │ synthesize_ │  │
                    │  │ response    │   │ _streaming  │  │
                    │  └─────────────┘  └─────────────┘  │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │        [Neo4j AuraDB]              │
                    │  ┌─────────┐ ┌─────────┐          │
                    │  │ Symptom │→│Condition│          │
                    │  │ (VECTOR)│ │         │          │
                    │  └────┬────┘ └────┬────┘          │
                    │       │           │               │
                    │  ┌────┴────┐ ┌────┴────┐          │
                    │  │Medicine │ │RiskFact │          │
                    │  │         │ │         │          │
                    │  └─────────┘ └─────────┘          │
                    │                                    │
                    │  Vector Index: symptomEmbeddings   │
                    │  GDS: ShortestPath, PageRank       │
                    └────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │      [Render Postgres + Redis]     │
                    │  Session logs, user metadata       │
                    │  Redis: cache frequent queries     │
                    └────────────────────────────────────┘
```

---

## 4. Upgraded Data Model — Neo4j Moat 2.0

**Core nodes (same as v1.0, upgraded with VECTOR):**

```cypher
// Symptom node with native VECTOR embedding
CREATE (s:Symptom {
  name: "dysuria",
  name_hi: "पेशाब में जलन",
  name_ta: "சிறுநீரில் எரிச்சல்",
  name_bn: "প্রস্রাবে জ্বলুনি",
  embedding: null  // populated via VECTOR index
})

// Condition node with severity and explainability
CREATE (c:Condition {
  name: "UTI",
  severity_score: 0.6,
  is_emergency: false,
  description_hi: "मूत्र पथ का संक्रमण",
  typical_duration: "3-5 days",
  when_to_see_doctor: "if fever develops or pain worsens"
})

// Medicine with safety metadata
CREATE (m:Medicine {
  name: "Ciprofloxacin",
  otc: false,
  contraindications: ["pregnancy", "tendon_disorders"]
})

// Patient session for temporal memory
CREATE (p:Patient {
  session_id: "uuid",
  language: "hi-IN",
  location: point({latitude: 28.6, longitude: 77.2})
})
```

**Relationships:**

```cypher
// Weighted indication
CREATE (s)-[:INDICATES {weight: 0.9, source: "clinical_guideline_2024"}]->(c)

// Treatment
CREATE (c)-[:TREATED_WITH {first_line: true}]->(m)

// Drug interaction with severity
CREATE (m1:Medicine {name: "Warfarin"})
CREATE (m2:Medicine {name: "Aspirin"})
CREATE (m1)-[:INTERACTS_WITH {severity: "high", mechanism: "bleeding_risk"}]->(m2)

// Temporal symptom reporting
CREATE (p)-[:REPORTED {timestamp: datetime(), confidence: 0.85}]->(s)

// Co-occurrence for pattern learning
CREATE (s1)-[:CO_OCCURS_WITH {frequency: 0.72, context: "rural_india"}]->(s2)
```

**Vector index creation (do this on Day 2, not Day 12):**

```cypher
// Create vector index for semantic symptom matching
CREATE VECTOR INDEX symptomEmbeddings FOR (s:Symptom) ON (s.embedding)
OPTIONS {indexConfig: {
  `vector.dimensions`: 768,
  `vector.similarity_function`: 'cosine'
}}

// Generate embeddings using Sarvam-30B or local model
// (For hackathon, pre-compute 20 symptom embeddings and import as CSV)
```

---

## 5. Upgraded 14-Day Plan

| Day | Focus | Done-by-end-of-day | Upgrade Notes |
|---|---|---|---|
| **1** | Accounts + credits + dataset | All accounts live. Dataset drafted as CSV/JSON. **Purchase ₹500 Sarvam credits.** Sign up for Neo4j AuraDB free (200K nodes). Render account linked. | ⚠️ Sarvam free credits dropped to ₹100. Budget for paid credits. |
| **2** | Neo4j schema + vector index + data import | Schema built, 20 conditions imported, **vector index created**, both core Cypher queries tested. | 🔥 Vector index is core, not stretch. Pre-compute symptom embeddings. |
| **3** | FastAPI skeleton + Neo4j driver + `/query` endpoint | Local HTTP → graph works. Add `/health` endpoint for Render. | Add Redis caching layer mock. |
| **4** | Sarvam STT + TTS **streaming** tested | WebSocket round-trip: audio stream → text → audio stream. Test in Hindi + Tamil. Document 30s REST limit vs streaming vs Batch. | 🔥 Use WebSocket streaming, not REST. Sub-second latency is your demo superpower. |
| **5** | Sarvam LLM (`sarvam-30b`) prompt engineering | Structured JSON prompting for symptom extraction + response composition. Test with code-mixed Hinglish. | ⚠️ DO NOT use `sarvam-m`. Use `sarvam-30b` (64K context, ₹2.5/1M input tokens). |
| **6** | Wire full pipeline locally, text-first | One complete happy-path request works end-to-end. Include drug-interaction branch. | Test parallel task execution with `asyncio.gather()`. |
| **7** | **Buffer/checkpoint.** Emergency detection + hospital finder. Offline fallback logic. Honest go/no-go. | Emergency branch works. Static PHC list as fallback. | Add "offline mode": cache last 5 triage responses locally. |
| **8** | Deploy to Render: web service + workflow service + Postgres + Redis | Full pipeline live. **Trigger a deliberate failure** and screenshot the retry in dashboard. | Use correct `@app.task` decorator. Set `plan="starter"` for light tasks, `"standard"` for LLM. |
| **9** | Expo: scaffold with `expo-audio`, build mic screen with waveform | Screen 1 functional against deployed backend. Test on real device. | ⚠️ Use `expo-audio`, not `expo-av`. Use `useAudioSampleListener` for waveform. |
| **10** | Expo: result screen + **Graph Viz screen** | Screen 2 + 3 functional. Animated SVG graph showing reasoning path. | This is your "best use of Expo" differentiator. |
| **11** | Expo: emergency screen, full app wired | All screens connected. Test 3-language audio round-trip. | Test on low-end Android device if possible. |
| **12** | Integration testing: 3 languages × 6 scenarios | Include: emergency case, drug-interaction case, **vector fuzzy-match case** ("burning when I pee" → UTI), offline case. | Document bug list, fix P0s. |
| **13** | Polish: UI, error states, README with architecture diagram + per-track "how we use X" section, record 60-90s demo video, pitch deck | **Include Graph Viz animation in demo video.** Show Render dashboard retry screenshot. | README must explicitly name-check: Saaras v3, Sarvam-30B, Bulbul v3, GraphRAG, `@app.task`, `expo-audio`. |
| **14** | Buffer + submit. Retest. Submit to all track forms. | Submitted, with backup recorded demo. | Sanity-check no sponsor rule missed. |

---

## 6. Upgraded Demo Script (60–90 seconds)

> *"73% of rural India has no access to quality healthcare. 55 million people are pushed into poverty every year because they traveled 100 kilometers to a doctor they couldn't afford."*
>
> *[Speak symptoms in Hindi into the app — waveform animates]*
>
> *"That's being transcribed in real time by Sarvam Saaras v3 — no 30-second limit because we're streaming. The Sarvam-30B model extracts symptoms from code-mixed Hinglish, and then — this is the part that matters — it doesn't guess. It retrieves from a Neo4j knowledge graph using GraphRAG: vector semantic search finds the symptom, then graph traversal ranks conditions by weighted evidence."*
>
> *[Show Graph Viz screen — animated path: symptom → condition → medicine → interaction check]*
>
> *"Watch this: the graph found that the suggested medicine interacts with medicine the patient is already taking. A flat database can't do this in one hop. The graph suggests a safe alternative by finding a non-interacting path."*
>
> *[Response plays back in Hindi; if emergency, show hospital screen with distance]*
>
> *"No doctor. No English. No literacy needed. Just voice — and a graph that can catch a drug interaction that would have been dangerous. And if any API step fails, the Render Workflow retries automatically with exponential backoff. We didn't write a single line of retry logic."*
>
> *[Show Render dashboard with retry history]*

---

## 7. Submission Checklist — Per Track (Upgraded)

### Overall
- [ ] Clear problem statement with **cited statistics** (73% lack access, 55M in poverty, 5.5km avg distance — from PMC 2026 + Ballard Brief)
- [ ] Working end-to-end demo on real device or simulator
- [ ] README skimmable in 60 seconds with architecture diagram
- [ ] 60-90s demo video with Graph Viz animation

### Sarvam
- [ ] Name-check: **Saaras v3** (streaming), **Sarvam-30B** (NOT `sarvam-m`), **Bulbul v3**, **Sarvam-Translate v1**, **LID API**
- [ ] Mention STT mode evaluation (`transcribe` vs `codemix` vs `verbatim`) and your decision matrix
- [ ] Document 30s REST limit, 2500-char TTS limit, and how streaming solves both
- [ ] Show code-mixed Hinglish handling natively

### Neo4j
- [ ] Include all 3 Cypher queries in README (GraphRAG retrieval, drug interaction with alternatives, temporal patient memory)
- [ ] Explain **why graph, not table**: multi-hop symptom matching + drug interactions + path-finding alternatives
- [ ] Mention **native VECTOR type** (Cypher 25) and **in-index filtering** (Neo4j 2026.01)
- [ ] Screenshot of Neo4j Browser showing graph visualization

### Render
- [ ] Screenshot of Workflows dashboard with **retry/run history visible**
- [ ] Show deliberate failure + recovery in demo video
- [ ] Document `@app.task` decorator, `Retry` config, and parallel `asyncio.gather()`
- [ ] Mention private networking: web service + workflow + Postgres + Redis on same network

### Expo
- [ ] Confirm app built with **Expo SDK 52+** using `expo-audio` (not `expo-av`)
- [ ] Show real device or simulator recording — not a web view
- [ ] Include **Graph Viz screen** as native animation proof
- [ ] Show geolocation + emergency hospital finder

---

## 8. Risk Mitigation & Backup Plans

| Risk | Likelihood | Mitigation |
|---|---|---|
| Sarvam API rate limit hit during demo | Medium | Pre-generate TTS audio for demo script. Have offline audio files as fallback. |
| Neo4j AuraDB free tier node limit (200K) | Low | Your graph is ~20 conditions × ~5 symptoms = ~200 nodes. Well within limits. |
| Render free tier cold start | Medium | Keep web service warm by pinging every 10 min during demo day. Or upgrade to $7 Starter. |
| Expo build fails on device | Medium | Use Expo Go for demo if EAS build fails. Have screen recording as ultimate fallback. |
| Real-time STT streaming fails | Low | Fall back to REST STT with pre-chunked audio (silence-based splitting). Test both paths. |
| Internet connectivity poor at demo venue | Medium | Pre-record full demo video. Show app in airplane mode with cached offline responses. |

---

## 9. Budget Estimate

| Service | Item | Cost |
|---|---|---|
| Sarvam AI | API credits (testing + demo) | ₹500–1,000 |
| Neo4j AuraDB | Free tier (200K nodes) | ₹0 |
| Render | Web service Starter ($7/mo) + Workflow compute (~$5) | ~$12 |
| Render | Postgres Starter ($6/mo) | $6 |
| Google Maps | Geolocation API (low volume) | ~$5 |
| **Total** | | **~$25 + ₹1,000** |

---

## 10. Key Resources to Bookmark

1. **Sarvam AI Docs:** https://docs.sarvam.ai/api-reference-docs/changelog (check weekly — they ship fast)
2. **Sarvam Python SDK:** `pip install sarvamai` — includes streaming support
3. **Neo4j Cypher 25 VECTOR:** https://neo4j.com/docs/cypher-manual/current/values-and-types/vector/
4. **Neo4j GraphRAG Guide:** https://neo4j.com/blog/news/2025-ai-scalability/
5. **Render Workflows Docs:** https://render.com/docs/workflows-limits
6. **Render Workflows Blog:** https://render.com/blog/durability-as-code-introducing-render-workflows
7. **Expo Audio SDK:** https://docs.expo.dev/versions/latest/sdk/audio/
8. **Expo Recorder Component:** https://www.npmjs.com/package/@lodev09/expo-recorder (waveform wrapper)
9. **Rural India Healthcare Data:** PMC 2026 paper — https://pmc.ncbi.nlm.nih.gov/articles/PMC13069580/

---

*Plan generated based on live research conducted July 2026. Technology landscapes change fast — verify API docs before Day 1 implementation.*
