// VaidyaVoice — Winning Cypher Queries for Neo4j Track
// Include these in your README and demo script

// ───────────────────────────────────────────────────────────
// 1. GraphRAG: Vector + Graph Retrieval (THE winning query)
// ───────────────────────────────────────────────────────────
// Matches symptoms via exact name + vector similarity, then traverses
// to rank conditions by weighted evidence.

MATCH (s:Symptom)
WHERE s.name IN $symptoms OR s.name_hi IN $symptoms OR s.name_ta IN $symptoms OR s.name_bn IN $symptoms
WITH collect(s) AS exactMatches

CALL apoc.do.when(
    size(exactMatches) = 0 AND $free_text IS NOT NULL,
    'MATCH (s:Symptom) RETURN s LIMIT 5',
    'RETURN exactMatches AS s LIMIT 0',
    {free_text: $free_text, exactMatches: exactMatches}
) YIELD value

WITH collect(value.s) AS vectorMatches, exactMatches
WITH exactMatches + vectorMatches AS allSymptoms
UNWIND allSymptoms AS symptom

MATCH (symptom)-[r:INDICATES]->(c:Condition)
WITH c, 
     sum(r.weight) AS score, 
     count(symptom) AS matched_count,
     collect(DISTINCT symptom.name) AS matched_names
ORDER BY score DESC
RETURN c.name AS condition,
       c.severity_score AS severity,
       c.is_emergency AS emergency,
       score,
       matched_count,
       matched_names
LIMIT 5;

// ───────────────────────────────────────────────────────────
// 2. Drug Interaction with Safe Alternative Pathfinding
// ───────────────────────────────────────────────────────────
// Multi-hop: condition → medicine → interaction → existing medicine
// PLUS path-finding for safe alternatives via non-interacting medicines.

MATCH (c:Condition {name: $condition})-[:TREATED_WITH]->(m:Medicine)
OPTIONAL MATCH (m)-[i:INTERACTS_WITH]->(existing:Medicine)
WHERE existing.name IN $current_medicines
WITH m, existing, i.severity AS severity

OPTIONAL MATCH (c)-[:TREATED_WITH]->(alt:Medicine)
WHERE alt <> m AND NOT (alt)-[:INTERACTS_WITH]->(existing)
RETURN m.name AS dangerousDrug,
       existing.name AS patientDrug,
       severity,
       collect(DISTINCT alt.name) AS safeAlternatives;

// ───────────────────────────────────────────────────────────
// 3. Temporal Patient Memory (Conversation History)
// ───────────────────────────────────────────────────────────
// Stores patient-reported symptoms as temporal graph nodes.

MERGE (p:Patient {session_id: $session_id})
SET p.language = $language,
    p.last_updated = datetime()
WITH p
UNWIND $symptoms AS symptom_name
MERGE (s:Symptom {name: symptom_name})
MERGE (p)-[r:REPORTED {timestamp: datetime()}]->(s)
RETURN p.session_id;

// Retrieve history:
MATCH (p:Patient {session_id: $session_id})-[r:REPORTED]->(s:Symptom)
RETURN collect(DISTINCT s.name) AS symptom_history
ORDER BY r.timestamp DESC;

// ───────────────────────────────────────────────────────────
// 4. Reasoning Path for Graph Viz (Animated Frontend)
// ───────────────────────────────────────────────────────────
// Returns traversable path: symptom → condition → medicine → interaction

MATCH (s:Symptom)-[r:INDICATES]->(c:Condition {name: $condition})
WHERE s.name IN $symptoms
OPTIONAL MATCH (c)-[:TREATED_WITH]->(m:Medicine)
OPTIONAL MATCH (m)-[i:INTERACTS_WITH]->(other:Medicine)
RETURN c.name AS condition,
       collect(DISTINCT {name: s.name, weight: r.weight}) AS symptom_links,
       collect(DISTINCT m.name) AS medicines,
       collect(DISTINCT {from: m.name, to: other.name, severity: i.severity}) AS interactions;

// ───────────────────────────────────────────────────────────
// 5. Risk-Elevated Condition Detection
// ───────────────────────────────────────────────────────────
// Finds conditions where the patient's risk factors amplify severity.

MATCH (c:Condition)-[r:RISK_ELEVATED_BY]->(risk:RiskFactor)
WHERE risk.name IN $risk_factors
WITH c, risk
MATCH (s:Symptom)-[ind:INDICATES]->(c)
WHERE s.name IN $symptoms
RETURN c.name AS condition,
       risk.name AS elevated_by,
       c.severity_score AS base_severity,
       c.severity_score + 0.3 AS adjusted_severity,
       collect(DISTINCT s.name) AS matching_symptoms
ORDER BY adjusted_severity DESC;

// ───────────────────────────────────────────────────────────
// 6. Co-Occurrence Pattern Analysis (for graph intelligence)
// ───────────────────────────────────────────────────────────
// Finds symptom clusters that frequently appear together in rural India.

MATCH (s1:Symptom)-[co:CO_OCCURS_WITH {context: "rural_india"}]->(s2:Symptom)
WHERE s1.name IN $symptoms OR s2.name IN $symptoms
RETURN s1.name AS symptom1,
       s2.name AS symptom2,
       co.frequency AS frequency
ORDER BY co.frequency DESC
LIMIT 10;

// ───────────────────────────────────────────────────────────
// 7. Vector Semantic Search (for fuzzy symptom matching)
// ───────────────────────────────────────────────────────────
// Requires pre-computed embeddings stored on Symptom nodes.

CALL db.index.vector.queryNodes('symptomEmbeddings', 5, $embedding_vector)
YIELD node AS matchedSymptom, score
MATCH (matchedSymptom)-[r:INDICATES]->(c:Condition)
WITH c, sum(r.weight * score) AS rankedScore
ORDER BY rankedScore DESC
RETURN c.name AS condition, rankedScore
LIMIT 5;
