// VaidyaVoice Neo4j Schema — Rural India Health Knowledge Graph
// Run this first to create constraints and indexes

// ───────────────────────────────────────────────────────────
// Constraints (unique identifiers)
// ───────────────────────────────────────────────────────────
CREATE CONSTRAINT symptom_name IF NOT EXISTS
FOR (s:Symptom) REQUIRE s.name IS UNIQUE;

CREATE CONSTRAINT condition_name IF NOT EXISTS
FOR (c:Condition) REQUIRE c.name IS UNIQUE;

CREATE CONSTRAINT medicine_name IF NOT EXISTS
FOR (m:Medicine) REQUIRE m.name IS UNIQUE;

CREATE CONSTRAINT risk_factor_name IF NOT EXISTS
FOR (r:RiskFactor) REQUIRE r.name IS UNIQUE;

CREATE CONSTRAINT patient_session IF NOT EXISTS
FOR (p:Patient) REQUIRE p.session_id IS UNIQUE;

// ───────────────────────────────────────────────────────────
// Full-text index for symptom search
// ───────────────────────────────────────────────────────────
CREATE FULLTEXT INDEX symptomSearch IF NOT EXISTS
FOR (s:Symptom) ON EACH [s.name, s.name_hi, s.name_ta, s.name_bn];

// ───────────────────────────────────────────────────────────
// Vector index for semantic symptom matching (GraphRAG)
// Requires Neo4j 5.18+ with vector support
// ───────────────────────────────────────────────────────────
CREATE VECTOR INDEX symptomEmbeddings IF NOT EXISTS
FOR (s:Symptom) ON (s.embedding)
OPTIONS {indexConfig: {
  `vector.dimensions`: 384,
  `vector.similarity_function`: 'cosine'
}};
