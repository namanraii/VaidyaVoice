"""Neo4j graph service — GraphRAG operations, drug interactions, and patient memory."""
import logging
from typing import List, Dict, Any, Optional
from neo4j import AsyncGraphDatabase, AsyncDriver
from contextlib import asynccontextmanager
from sentence_transformers import SentenceTransformer

from app.config import get_settings
from app.models.schemas import ConditionResult, DrugInteraction, LanguageCode

logger = logging.getLogger(__name__)
settings = get_settings()


class Neo4jService:
    """Async Neo4j service for all graph operations."""
    
    def __init__(self):
        self._driver: Optional[AsyncDriver] = None
        self._model: Optional[SentenceTransformer] = None
    
    async def connect(self):
        """Initialize Neo4j driver."""
        self._driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )
        await self._driver.verify_connectivity()
        logger.info("Neo4j connected")
        
        # Load SentenceTransformer model for query embeddings
        try:
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("SentenceTransformer model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load SentenceTransformer: {e}")
            self._model = None
    
    async def close(self):
        """Close driver."""
        if self._driver:
            await self._driver.close()
    
    async def health_check(self) -> bool:
        """Check if Neo4j is reachable."""
        try:
            if not self._driver:
                return False
            await self._driver.verify_connectivity()
            return True
        except Exception:
            return False
    
    # ───────────────────────────────────────────────────────────
    # GraphRAG: Vector + Graph retrieval
    # ───────────────────────────────────────────────────────────
    
    async def find_conditions_graphrag(
        self, 
        symptoms: List[str], 
        free_text: Optional[str] = None,
        language: LanguageCode = LanguageCode.HI
    ) -> List[ConditionResult]:
        """
        GraphRAG: Match symptoms via exact name + vector similarity,
        then traverse graph for weighted condition ranking.
        """
        # Step 1: Find exact matches in any language
        exact_symptoms = []
        if symptoms:
            async with self._driver.session() as session:
                result = await session.run(
                    """
                    MATCH (s:Symptom)
                    WHERE toLower(s.name) IN [x IN $symptoms | toLower(x)]
                       OR toLower(s.name_hi) IN [x IN $symptoms | toLower(x)]
                       OR toLower(s.name_ta) IN [x IN $symptoms | toLower(x)]
                       OR toLower(s.name_bn) IN [x IN $symptoms | toLower(x)]
                    RETURN s.name AS name
                    """,
                    symptoms=symptoms
                )
                async for record in result:
                    exact_symptoms.append(record["name"])

        conditions = []
        
        # Step 2: Run Vector search if no exact matches are found and free_text is available
        if not exact_symptoms and free_text and self._model:
            logger.info(f"No exact matches found. Running semantic vector search for text: {free_text}")
            try:
                embedding_vector = self._model.encode(free_text).tolist()
                async with self._driver.session() as session:
                    result = await session.run(
                        """
                        CALL db.index.vector.queryNodes('symptomEmbeddings', 5, $embedding_vector)
                        YIELD node AS symptom, score
                        MATCH (symptom)-[r:INDICATES]->(c:Condition)
                        WITH c, 
                             sum(r.weight * score) AS score, 
                             count(symptom) AS matched_count,
                             collect(DISTINCT symptom.name) AS matched_names
                        ORDER BY score DESC
                        RETURN c.name AS name,
                               c.severity_score AS severity_score,
                               c.is_emergency AS is_emergency,
                               score,
                               matched_count,
                               matched_names
                        LIMIT 5
                        """,
                        embedding_vector=embedding_vector
                    )
                    async for record in result:
                        conditions.append(ConditionResult(
                            name=record["name"],
                            severity_score=record["severity_score"],
                            is_emergency=record["is_emergency"],
                            matched_score=record["score"],
                            matched_symptoms=record["matched_names"],
                            confidence=min(record["score"] / 2.0, 1.0)
                        ))
            except Exception as e:
                logger.error(f"Vector search failed: {e}")

        # Step 3: Run exact match graph traversal if conditions are still empty
        if not conditions:
            logger.info("Running exact match graph traversal...")
            # If no symptoms matched exactly, default to the original input symptoms list to attempt matching
            query_symptoms = exact_symptoms if exact_symptoms else symptoms
            async with self._driver.session() as session:
                result = await session.run(
                    """
                    MATCH (s:Symptom)-[r:INDICATES]->(c:Condition)
                    WHERE toLower(s.name) IN [x IN $symptoms | toLower(x)]
                    WITH c, 
                         sum(r.weight) AS score, 
                         count(s) AS matched_count,
                         collect(DISTINCT s.name) AS matched_names
                    ORDER BY score DESC
                    RETURN c.name AS name,
                           c.severity_score AS severity_score,
                           c.is_emergency AS is_emergency,
                           score,
                           matched_count,
                           matched_names
                    LIMIT 5
                    """,
                    symptoms=query_symptoms
                )
                async for record in result:
                    conditions.append(ConditionResult(
                        name=record["name"],
                        severity_score=record["severity_score"],
                        is_emergency=record["is_emergency"],
                        matched_score=record["score"],
                        matched_symptoms=record["matched_names"],
                        confidence=min(record["score"] / 2.0, 1.0)
                    ))

        return conditions
    
    # ───────────────────────────────────────────────────────────
    # Drug Interactions: Multi-hop with safe alternatives
    # ───────────────────────────────────────────────────────────
    
    async def check_drug_interactions(
        self, 
        condition_name: str, 
        current_medicines: List[str]
    ) -> List[DrugInteraction]:
        """
        Multi-hop drug interaction check with GDS path-finding for alternatives.
        """
        if not current_medicines:
            return []
        
        async with self._driver.session() as session:
            result = await session.run(
                """
                MATCH (c:Condition {name: $condition})
                      -[:TREATED_WITH]->(m:Medicine)
                OPTIONAL MATCH (m)-[i:INTERACTS_WITH]->(existing:Medicine)
                WHERE existing.name IN $current_medicines
                WITH m, existing, i.severity AS severity
                
                // Find safe alternatives via non-interacting path
                OPTIONAL MATCH (c)-[:TREATED_WITH]->(alt:Medicine)
                WHERE alt <> m AND NOT (alt)-[:INTERACTS_WITH]->(existing)
                RETURN m.name AS dangerous_drug,
                       existing.name AS patient_drug,
                       severity,
                       collect(DISTINCT alt.name) AS safe_alternatives
                """,
                condition=condition_name,
                current_medicines=current_medicines
            )
            
            interactions = []
            async for record in result:
                if record["dangerous_drug"]:
                    interactions.append(DrugInteraction(
                        dangerous_drug=record["dangerous_drug"],
                        patient_drug=record["patient_drug"],
                        severity=record["severity"] or "unknown",
                        safe_alternatives=record["safe_alternatives"] or []
                    ))
            
            return interactions
    
    # ───────────────────────────────────────────────────────────
    # Patient Temporal Memory
    # ───────────────────────────────────────────────────────────
    
    async def record_symptom_session(
        self, 
        session_id: str, 
        symptoms: List[str], 
        language: str = "hi-IN"
    ):
        """Store patient-reported symptoms as temporal graph nodes."""
        async with self._driver.session() as session:
            await session.run(
                """
                MERGE (p:Patient {session_id: $session_id})
                SET p.language = $language,
                    p.last_updated = datetime()
                WITH p
                UNWIND $symptoms AS symptom_name
                MERGE (s:Symptom {name: symptom_name})
                MERGE (p)-[r:REPORTED {timestamp: datetime()}]->(s)
                RETURN p.session_id
                """,
                session_id=session_id,
                symptoms=symptoms,
                language=language
            )
    
    async def get_patient_history(self, session_id: str) -> List[str]:
        """Retrieve symptom history for temporal trend analysis."""
        async with self._driver.session() as session:
            result = await session.run(
                """
                MATCH (p:Patient {session_id: $session_id})
                      -[r:REPORTED]->(s:Symptom)
                RETURN collect(DISTINCT s.name) AS symptom_history
                ORDER BY r.timestamp DESC
                """,
                session_id=session_id
            )
            record = await result.single()
            return record["symptom_history"] if record else []
    
    # ───────────────────────────────────────────────────────────
    # Graph Visualization: Reasoning path for frontend
    # ───────────────────────────────────────────────────────────
    
    async def get_reasoning_path(
        self, 
        symptom_names: List[str], 
        condition_name: str
    ) -> Dict[str, Any]:
        """Return a traversable path for the Graph Viz screen."""
        async with self._driver.session() as session:
            result = await session.run(
                """
                MATCH (s:Symptom)-[r:INDICATES]->(c:Condition {name: $condition})
                WHERE toLower(s.name) IN [x IN $symptoms | toLower(x)]
                OPTIONAL MATCH (c)-[:TREATED_WITH]->(m:Medicine)
                OPTIONAL MATCH (m)-[i:INTERACTS_WITH]->(other:Medicine)
                RETURN c.name AS condition,
                       collect(DISTINCT {name: s.name, weight: r.weight}) AS symptom_links,
                       collect(DISTINCT m.name) AS medicines,
                       collect(DISTINCT {from: m.name, to: other.name, severity: i.severity}) AS interactions
                """,
                symptoms=symptom_names,
                condition=condition_name
            )
            
            record = await result.single()
            if not record:
                return {}
            
            return {
                "condition": record["condition"],
                "symptoms": record["symptom_links"],
                "medicines": record["medicines"],
                "interactions": record["interactions"]
            }


# Singleton
neo4j_service = Neo4jService()
