// Vector Index Setup for VaidyaVoice GraphRAG
// Run AFTER schema.cypher and data.cypher
// Requires Neo4j 5.18+ with vector index support

// ───────────────────────────────────────────────────────────
// Pre-computed embeddings for 20 symptoms (768-dim, cosine)
// In production, generate via Sarvam-30B or local embedding model
// For hackathon, import pre-computed embeddings as CSV
// ───────────────────────────────────────────────────────────

// Option A: Import pre-computed embeddings from CSV
// CSV format: name,embedding (pipe-separated floats)
// LOAD CSV WITH HEADERS FROM 'file:///symptom_embeddings.csv' AS row
// MATCH (s:Symptom {name: row.name})
// SET s.embedding = [x IN split(row.embedding, '|') | toFloat(x)];

// Option B: Set embeddings programmatically (example for 3 symptoms)
// Replace with real embeddings from an embedding model
MATCH (s:Symptom {name: "fever"})
SET s.embedding = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];  // placeholder — replace with 768 real dims

MATCH (s:Symptom {name: "headache"})
SET s.embedding = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];  // placeholder

MATCH (s:Symptom {name: "cough"})
SET s.embedding = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.1];  // placeholder

// Note: For hackathon, generate embeddings using a script:
// python -c "from sentence_transformers import SentenceTransformer; ..."
// Or use Sarvam's embedding endpoint if available.
// Store all 30+ symptom embeddings in the graph for full GraphRAG.

// ───────────────────────────────────────────────────────────
// Verify vector index is populated
// ───────────────────────────────────────────────────────────
CALL db.index.vector.queryNodes('symptomEmbeddings', 3, [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
YIELD node, score
RETURN node.name, score;
