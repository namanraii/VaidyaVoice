# VaidyaVoice Setup Checklist

## Phase 1: Credentials (Do This First)

- [ ] **Neo4j AuraDB credentials** — Share URI + Password with me
  - Get from: https://neo4j.com/aura → Your Database → "Connect" tab
  - Looks like: `neo4j+s://abc123.databases.neo4j.io:7687`

- [ ] **Google Maps API key** (Optional — for emergency hospital finder)
  - Get from: https://console.cloud.google.com/ → APIs & Services → Credentials
  - Enable: Places API + Geocoding API
  - **Fallback:** App works with static hospital data without this

## Phase 2: Neo4j Data Import (10 min)

After I update credentials, run these in Neo4j Browser in order:

```cypher
// 1. Create schema (constraints + indexes)
:source neo4j/schema.cypher

// 2. Import all data (20 conditions, 30+ symptoms, medicines, interactions)
:source neo4j/data.cypher

// 3. Set up vector embeddings (for GraphRAG)
:source neo4j/vector_setup.cypher
```

**Verify import:**
```cypher
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count
```
Expected: ~20 Conditions, ~30 Symptoms, ~20 Medicines, ~7 RiskFactors

## Phase 3: Backend Testing (5 min)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set env vars (or copy .env.example to .env and fill in)
export NEO4J_URI=your_uri
export NEO4J_PASSWORD=your_password

# Run tests
python test_backend.py
```

Expected: All 3 tests should pass (Neo4j, Sarvam API, Sarvam TTS).

## Phase 4: Deploy to Render (15 min)

1. Push code to GitHub
2. Go to https://render.com → "Blueprints" → "New Blueprint Instance"
3. Select your repo → Render reads `render.yaml` automatically
4. Add these **secret env vars** in Render Dashboard:
   - `SARVAM_API_KEY` (already in config, but verify)
   - `NEO4J_URI`
   - `NEO4J_PASSWORD`
   - `GOOGLE_MAPS_API_KEY` (optional)
5. Deploy — Render auto-creates: Web Service + Workflow + Postgres + Redis

## Phase 5: Expo App (20 min)

```bash
cd expo
npm install
npx expo start
```

- Scan QR code with **Expo Go** app (download from App Store / Play Store)
- Test on real device for mic + geolocation

**Update API URL** in `expo/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-render-url.onrender.com';
```

## Phase 6: Demo Preparation (2 hours)

- [ ] Record 3 test scenarios in Hindi (fever, stomach pain, emergency)
- [ ] Test drug interaction scenario ("I take Warfarin and have chest pain")
- [ ] Screenshot Render dashboard with retry history
- [ ] Record 60-90 second demo video
- [ ] Build pitch deck (I can generate this)

## Budget Check

| Service | Cost |
|---------|------|
| Sarvam AI | ₹100 free + budget ₹500 for testing |
| Neo4j AuraDB | Free tier (200K nodes) |
| Render | ~$25 (Web + Workflow + Postgres + Redis) |
| Google Maps | ~$5 (optional) |
| **Total** | **~$30 + ₹600** |

## What I Still Need From You

1. **Neo4j URI + Password** (from your screenshot)
2. **Google Maps API key** (optional)
3. **Render account** (sign up yourself, I can't do this)
4. **GitHub repo** (push code, I can't create accounts)

Once you share the Neo4j credentials, I'll update everything and you can start testing immediately.
