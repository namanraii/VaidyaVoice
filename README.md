# VaidyaVoice

> **GraphRAG-powered rural health triage — voice in, voice out.**
> A rural patient speaks their symptoms in Hindi, Tamil, or Bengali into a phone. In under 3 seconds, a knowledge-graph-backed triage agent tells them — in their own voice — what it might be, what to do, and whether to run to a hospital right now.

---

## Architecture

```
[Expo App]
   mic recording (expo-audio) ───────────────────┐
                                                  ▼
                                     [FastAPI on Render]
                                                  │
            ┌─────────────────────────────────────┼─────────────────────────────────────┐
            ▼                                     ▼                                     ▼
 [RENDER WORKFLOW]                                                        [Neo4j AuraDB]
   Step 1: transcribe_audio      (Sarvam Saaras v3)
   Step 2: extract_symptoms      (Sarvam-30B LLM, structured JSON)
   Step 3: query_graph           (Neo4j GraphRAG — vector + graph traversal)
   Step 4: check_interactions    (Neo4j — multi-hop drug interaction + alternatives)
   Step 5: compose_response      (Sarvam-30B, urgency-aware)
   Step 6: synthesize_speech     (Sarvam Bulbul v3 TTS)
   Step 7: store_session         (Neo4j temporal patient memory)
            │
            ▼
  JSON + audio (base64) → Expo
            │
            ▼
  [Expo] plays audio, shows triage card, shows Graph Viz, shows emergency map
```

---

## Why This Wins Each Track

### Sarvam AI — "Best Use of Sarvam"
We chain **five** Sarvam products in a single pipeline:

1. **Saaras v3** (STT) — WebSocket streaming for real-time transcription, REST for batch fallback
2. **Sarvam-30B** (LLM) — Structured symptom extraction from code-mixed Hinglish; response composition
3. **Bulbul v3** (TTS) — Matched speaker per language (`shubh` for Hindi, `kavya` for Tamil, `roopa` for Bengali)
4. **Sarvam-Translate v1** — 22-language expansion for future scale
5. **LID API** — Auto-language detection on first utterance

**Engineered constraints:**
- REST STT capped at 30s → solved with WebSocket streaming (<250ms latency)
- REST TTS capped at 2,500 chars → forces concise, high-value triage advice
- Code-mixed Hinglish handled natively by Sarvam-30B without pre-translation

### Neo4j — "Best Use of AuraDB"
This is a **GraphRAG** system, not a lookup table:

- **Native VECTOR type** (Cypher 25) stores symptom embeddings for semantic fuzzy matching
- **In-index filtering** (Neo4j 2026.01) enables metadata-predicated vector search
- **Weighted multi-hop traversal** ranks conditions by evidence strength, not flat lookup
- **Multi-hop drug interaction** with **path-finding for safe alternatives** — the query that separates "used a graph" from "understood why a graph"
- **Temporal patient memory** — symptoms stored as graph nodes with timestamps for longitudinal analysis

**The winning queries:** See `neo4j/queries.cypher`

### Render — "Best Use of Workflows"
Each pipeline step is a durable `@app.task` with:

- **Automatic retries** with exponential backoff (no custom retry logic)
- **Parallel execution** — `query_graph` and `check_interactions` run simultaneously via `asyncio.gather()`
- **Per-task compute plans** — `starter` for light tasks, `standard` for LLM calls
- **Chaos engineering demo** — `simulate_failure` task deliberately throws a 429, visible in Render dashboard with retry history
- **Private network** — Web service + Workflow + Postgres + Redis, zero glue code

### Expo — "Best Mobile Experience"
- **Native mic capture** with `expo-audio` (not `expo-av`, which is deprecated)
- **Real-time waveform** via `useAudioSampleListener`
- **Graph Viz screen** — animated SVG showing the reasoning path (symptom → condition → medicine → interaction). This is native mobile proof a web view can't replicate.
- **Device geolocation** → emergency hospital finder with Call 108
- **3 polished screens** — a finished app, not a wrapper

---

## File Structure

```
VaidyaVoice/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI gateway with lifespan
│   │   ├── config.py            # Settings (placeholder API keys)
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── api/
│   │   │   ├── health.py        # /health endpoint
│   │   │   ├── triage.py        # /triage/audio and /triage/text
│   │   │   └── websocket.py     # WebSocket streaming handler
│   │   └── services/
│   │       ├── neo4j_service.py # GraphRAG, drug checks, patient memory
│   │       ├── sarvam_service.py # STT, TTS, LLM, LID, Translate wrappers
│   │       └── triage_engine.py  # Full pipeline orchestration
│   ├── workflows/
│   │   └── tasks.py             # Render Workflows @app.task definitions
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml              # Render Blueprint (web + workflow + postgres + redis)
├── neo4j/
│   ├── schema.cypher            # Constraints, indexes, vector index
│   ├── data.cypher              # 20 conditions, 30+ symptoms, medicines, interactions
│   ├── queries.cypher           # 7 winning Cypher queries for README + demo
│   └── vector_setup.cypher      # Pre-computed symptom embeddings
├── expo/
│   ├── app/
│   │   ├── _layout.tsx          # Expo Router navigation
│   │   ├── index.tsx            # Screen 1: Mic + Language picker
│   │   ├── result.tsx           # Screen 2: Triage card + conditions + interactions
│   │   ├── graph-viz.tsx        # Screen 3: Animated reasoning path
│   │   └── emergency.tsx        # Screen 4: Hospital finder + Call 108
│   ├── components/
│   │   ├── MicButton.tsx        # Pulsing animated mic button
│   │   ├── Waveform.tsx         # Real-time audio visualization
│   │   ├── TriageCard.tsx       # Color-coded result card
│   │   ├── SymptomChips.tsx     # Horizontal extracted symptoms
│   │   └── GraphVisualizer.tsx  # Animated SVG graph reasoning
│   ├── hooks/
│   │   ├── useAudioRecorder.ts  # expo-audio recording hook
│   │   ├── useTriageApi.ts      # API call state management
│   │   └── useLocation.ts       # Geolocation + hospital finder
│   ├── services/
│   │   └── api.ts               # Fetch wrappers
│   ├── constants/
│   │   └── colors.ts            # Theme, triage colors, graph viz palette
│   ├── package.json
│   └── app.json
├── README.md
└── VaidyaVoice_Upgraded_Master_Plan_v2.md
```

---

## Quick Start

### 1. Backend (Local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env
cat > .env <<EOF
SARVAM_API_KEY=your_key
NEO4J_URI=neo4j+s://your_instance.neo4j.io:7687
NEO4J_PASSWORD=your_password
EOF

uvicorn app.main:app --reload
```

### 2. Neo4j Data Import

1. Create free AuraDB instance at [neo4j.com/aura](https://neo4j.com/aura)
2. Open Neo4j Browser, run files in order:
   ```
   :source neo4j/schema.cypher
   :source neo4j/data.cypher
   :source neo4j/vector_setup.cypher
   ```

### 3. Expo App (Local)

```bash
cd expo
npm install
npx expo start
# Scan QR code with Expo Go app
```

---

## Demo Script (60–90 seconds)

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

## Budget

| Service | Item | Cost |
|---|---|---|
| Sarvam AI | API credits | ₹500–1,000 |
| Neo4j AuraDB | Free tier (200K nodes) | ₹0 |
| Render | Web + Workflow + Postgres | ~$25 |
| Google Maps | Geolocation API | ~$5 |
| **Total** | | **~$30 + ₹1,000** |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend | FastAPI | 0.115 |
| Orchestration | Render Workflows | Python SDK Beta |
| Graph DB | Neo4j AuraDB | 2026.01 (Cypher 25) |
| AI (STT/LLM/TTS) | Sarvam AI | Saaras v3, Sarvam-30B, Bulbul v3 |
| Mobile | Expo / React Native | SDK 52 |
| Audio | expo-audio | 0.3 |
| Cache | Redis (Render) | — |

---

## License

MIT — built for the hackathon community. If you fork this, cite the GraphRAG query.
