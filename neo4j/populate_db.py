import os
import re
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer

URI = "neo4j+s://35ddc00e.databases.neo4j.io:7687"
USER = "35ddc00e"
PASSWORD = "aya4oQPbzyMbsiTGQ65DBKNkOB8OxmnZEEwP2rb75Xs"

def run_cypher_file(session, file_path):
    print(f"Reading {file_path}...")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Split by semicolon for schema queries
    if file_path.endswith("schema.cypher"):
        statements = content.split(";")
        for stmt in statements:
            # Clean comments from statement
            lines = [line for line in stmt.split("\n") if not line.strip().startswith("//")]
            stmt_clean = " ".join(lines).strip()
            if not stmt_clean:
                continue
            print(f"Executing schema stmt: {stmt_clean[:60]}...")
            session.run(stmt_clean)
    else:
        # data.cypher contains CREATE statements that must run in a single transaction
        lines = []
        for line in content.split("\n"):
            line_str = line.strip()
            if not line_str or line_str.startswith("//"):
                continue
            lines.append(line_str)
        
        big_query = "\n".join(lines)
        session.run(big_query)
        print(f"Executed data.cypher contents as a single transaction successfully.")

def populate():
    print("Connecting to Neo4j AuraDB...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    with driver.session() as session:
        # 1. Clear database
        print("Clearing database...")
        session.run("MATCH (n) DETACH DELETE n")
        
        # 2. Run schema.cypher
        run_cypher_file(session, "schema.cypher")
        
        # 3. Run data.cypher
        run_cypher_file(session, "data.cypher")
        
        # 4. Generate embeddings for Symptoms
        print("Loading SentenceTransformer('all-MiniLM-L6-v2')...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("Fetching symptoms from database to embed...")
        result = session.run("MATCH (s:Symptom) RETURN s.name AS name, s.name_hi AS name_hi, s.name_ta AS name_ta, s.name_bn AS name_bn")
        
        symptoms = [record.data() for record in result]
        print(f"Found {len(symptoms)} symptoms. Generating embeddings...")
        
        for s in symptoms:
            name = s["name"]
            hi = s["name_hi"] or ""
            ta = s["name_ta"] or ""
            bn = s["name_bn"] or ""
            
            # Combine English and localized terms for rich semantic vector space
            text = f"Symptom: {name}. Localized names: {hi}, {ta}, {bn}."
            print(f"  Embedding: {text}")
            
            embedding = model.encode(text).tolist()
            
            # Save embedding back to database
            session.run(
                "MATCH (s:Symptom {name: $name}) SET s.embedding = $embedding",
                name=name,
                embedding=embedding
            )
            
        print("All symptom embeddings generated and stored successfully!")
        
        # 5. Verify database counts
        print("\n--- Verification ---")
        result = session.run("MATCH (n) RETURN labels(n)[0] AS type, count(n) AS count")
        for record in result:
            print(f"Node Type: {record['type']}, Count: {record['count']}")
            
        # Test vector query
        print("\nTesting vector index query...")
        test_vector = model.encode("I have a high fever").tolist()
        try:
            res = session.run(
                "CALL db.index.vector.queryNodes('symptomEmbeddings', 3, $embedding) YIELD node, score RETURN node.name, score",
                embedding=test_vector
            )
            print("Vector search results:")
            for record in res:
                print(f"  - {record['node.name']} (score: {record['score']:.4f})")
        except Exception as e:
            print("Vector search query failed:", e)

    driver.close()

if __name__ == "__main__":
    populate()
