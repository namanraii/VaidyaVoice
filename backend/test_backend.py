"""Test script to verify backend connectivity before deployment.
Run: python test_backend.py
"""
import asyncio
import base64
from app.config import get_settings
from app.services.neo4j_service import Neo4jService
from app.services.sarvam_service import SarvamService

settings = get_settings()

async def test_neo4j():
    """Test Neo4j connection and basic queries."""
    print("🔍 Testing Neo4j...")
    service = Neo4jService()
    try:
        await service.connect()
        healthy = await service.health_check()
        print(f"  ✅ Neo4j connected: {healthy}")
        
        # Test a simple query
        conditions = await service.find_conditions_graphrag(
            symptoms=["fever", "headache"],
            language="hi-IN"
        )
        print(f"  ✅ Found {len(conditions)} conditions for fever+headache")
        for c in conditions[:3]:
            print(f"     - {c.name} (score: {c.matched_score:.2f})")
        
        await service.close()
        return True
    except Exception as e:
        print(f"  ❌ Neo4j failed: {e}")
        return False

async def test_sarvam():
    """Test Sarvam API key validity."""
    print("🔍 Testing Sarvam AI...")
    service = SarvamService()
    try:
        # Test with a simple text
        result = await service.detect_language("Hello world")
        print(f"  ✅ Sarvam API key valid. Detected language: {result}")
        await service.close()
        return True
    except Exception as e:
        print(f"  ❌ Sarvam failed: {e}")
        print(f"     Check your API key and credits balance")
        return False

async def test_tts():
    """Test TTS generation."""
    print("🔍 Testing Sarvam TTS...")
    service = SarvamService()
    try:
        audio = await service.tts_rest(
            text="नमस्ते, आप कैसे हैं?",
            language="hi-IN",
            speaker="shubh"
        )
        print(f"  ✅ TTS generated: {len(audio)} bytes")
        await service.close()
        return True
    except Exception as e:
        print(f"  ❌ TTS failed: {e}")
        return False

async def main():
    print("=" * 50)
    print("VaidyaVoice Backend Test Suite")
    print("=" * 50)
    print()
    
    results = []
    results.append(("Neo4j", await test_neo4j()))
    print()
    results.append(("Sarvam API", await test_sarvam()))
    print()
    results.append(("Sarvam TTS", await test_tts()))
    print()
    
    print("=" * 50)
    print("Results Summary")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status}: {name}")
    
    all_passed = all(p for _, p in results)
    print()
    if all_passed:
        print("🎉 All tests passed! Backend is ready.")
    else:
        print("⚠️ Some tests failed. Fix the issues above before deploying.")
    
    return all_passed

if __name__ == "__main__":
    asyncio.run(main())
