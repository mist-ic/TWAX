"""Comprehensive TWAX Backend Test Suite.
Tests every component individually, then as an integrated system.
Run with: python test_all.py (while server is running on port 8000)
"""

import httpx
import asyncio
import json
import sys
from datetime import datetime

BASE = "http://127.0.0.1:8000"
PASS = 0
FAIL = 0


def result(name, ok, detail=""):
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"  ✅ {name}" + (f" — {detail}" if detail else ""))
    else:
        FAIL += 1
        print(f"  ❌ {name}" + (f" — {detail}" if detail else ""))


async def run_tests():
    global PASS, FAIL
    async with httpx.AsyncClient(base_url=BASE, timeout=120.0) as c:

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 1: Health Endpoint")
        print("=" * 60)
        try:
            r = await c.get("/health")
            data = r.json()
            result("GET /health returns 200", r.status_code == 200)
            result("Response has status=healthy", data.get("status") == "healthy")
            result("Response has service name", data.get("service") == "twax-backend")
        except Exception as e:
            result("Health endpoint", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 2: OpenAPI Schema")
        print("=" * 60)
        try:
            r = await c.get("/openapi.json")
            data = r.json()
            paths = list(data.get("paths", {}).keys())
            result("GET /openapi.json returns 200", r.status_code == 200)
            result("Has /health route", "/health" in paths)
            result("Has /api/articles route", "/api/articles" in paths)
            result("Has /api/generate-tweet route", "/api/generate-tweet" in paths)
            result("Has /api/publish route", "/api/publish" in paths)
            result(f"Total routes: {len(paths)}", len(paths) >= 6, f"Found: {paths}")
        except Exception as e:
            result("OpenAPI schema", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 3: Database — Save Article (with timezone-aware datetime)")
        print("=" * 60)
        test_article = {
            "title": "Test: GPT-5 Launches With Reasoning Capabilities",
            "url": f"https://test.example.com/gpt5-test-{int(datetime.now().timestamp())}",
            "content": "OpenAI has released GPT-5, featuring advanced reasoning capabilities that surpass previous models. The new system can solve complex math problems, write production code, and engage in multi-step planning with unprecedented accuracy.",
            "source": "TestTechCrunch",
            "published_at": "2026-02-10T12:00:00Z",
        }
        try:
            r = await c.post("/api/articles", json=test_article)
            data = r.json()
            result("POST /api/articles returns 200", r.status_code == 200, f"Status: {r.status_code}")
            result("Response has article id", "id" in data, f"ID: {data.get('id', 'MISSING')}")
            result("Response status is 'created'", data.get("status") == "created")

            saved_id = data.get("id")

            # Check AI fields (may be None if Gemini 503'd)
            if data.get("relevance_score") is not None:
                result("Gemini scoring worked", True, f"relevance={data['relevance_score']}, newsworthiness={data.get('newsworthiness_score')}")
            else:
                result("Gemini scoring (may be 503)", False, "Scoring returned None — Gemini may be throttled")

            if data.get("generated_tweet"):
                result("Tweet generation worked", True, f"Tweet: {data['generated_tweet'][:80]}...")
            else:
                result("Tweet generation (may need score>=6)", data.get("relevance_score") is not None and data["relevance_score"] < 6, "No tweet — score may be <6 or Gemini failed")
        except Exception as e:
            result("Save article", False, str(e))
            saved_id = None

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 4: Database — Retrieve Articles")
        print("=" * 60)
        try:
            r = await c.get("/api/articles?status=all")
            data = r.json()
            result("GET /api/articles?status=all returns 200", r.status_code == 200)
            result("Returns a list", isinstance(data, list))
            result(f"Has articles in DB", len(data) > 0, f"Count: {len(data)}")

            if data:
                art = data[0]
                result("Article has id", "id" in art)
                result("Article has title", "title" in art)
                result("Article has source", "source" in art)
                result("Article has status", "status" in art)
        except Exception as e:
            result("Retrieve articles", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 5: Duplicate Detection (URL-based)")
        print("=" * 60)
        try:
            r = await c.post("/api/articles", json=test_article)
            data = r.json()
            result("Duplicate returns 200", r.status_code == 200)
            result("Status is 'duplicate'", data.get("status") == "duplicate", f"Got: {data.get('status')}")
            result("Has message about existing ID", "already exists" in data.get("message", ""))
        except Exception as e:
            result("Duplicate detection", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 6: Article Approval Flow")
        print("=" * 60)
        if saved_id:
            try:
                r = await c.post(f"/api/articles/{saved_id}/approve?action=approve")
                data = r.json()
                result("POST approve returns 200", r.status_code == 200)
                result("Status is 'updated'", data.get("status") == "updated")

                # Verify status changed
                r2 = await c.get("/api/articles?status=approved")
                approved = r2.json()
                found = any(a["id"] == saved_id for a in approved)
                result("Article appears in approved list", found)
            except Exception as e:
                result("Approval flow", False, str(e))
        else:
            result("Approval flow", False, "No article ID from previous test")

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 7: Tweet Generation (direct endpoint)")
        print("=" * 60)
        try:
            r = await c.post(
                "/api/generate-tweet",
                params={
                    "article_id": "test-123",
                    "title": "DeepMind releases Gemini 3 Flash with breakthrough speed",
                    "content": "Google DeepMind has released Gemini 3 Flash, a new AI model that achieves state-of-the-art performance while being 10x faster than previous models.",
                }
            )
            if r.status_code == 200:
                data = r.json()
                result("POST /api/generate-tweet returns 200", True)
                result("Has tweet text", "tweet" in data, f"Tweet: {data.get('tweet', '')[:80]}")
                result("Has hashtags", "hashtags" in data, f"Hashtags: {data.get('hashtags', [])}")
                result("Tweet under 260 chars", len(data.get("tweet", "")) <= 260, f"Length: {len(data.get('tweet', ''))}")
            else:
                body = r.text
                result("Tweet generation", False, f"Status {r.status_code}: {body[:200]}")
        except Exception as e:
            result("Tweet generation", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 8: Article Without published_at (nullable field)")
        print("=" * 60)
        try:
            minimal_article = {
                "title": "Test: Minimal Article Without Datetime",
                "url": f"https://test.example.com/minimal-{int(datetime.now().timestamp())}",
                "content": "A minimal test article to verify nullable fields work correctly.",
                "source": "TestSource",
            }
            r = await c.post("/api/articles", json=minimal_article)
            data = r.json()
            result("Minimal article saves OK", r.status_code == 200 and data.get("status") == "created")
        except Exception as e:
            result("Minimal article", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("TEST 9: Error Handling — Invalid Approval Action")
        print("=" * 60)
        if saved_id:
            try:
                r = await c.post(f"/api/articles/{saved_id}/approve?action=invalid_action")
                result("Invalid action returns 400", r.status_code == 400)
            except Exception as e:
                result("Error handling", False, str(e))

        # ============================================================
        print("\n" + "=" * 60)
        print("RESULTS SUMMARY")
        print("=" * 60)
        total = PASS + FAIL
        print(f"\n  Total: {total} tests")
        print(f"  ✅ Passed: {PASS}")
        print(f"  ❌ Failed: {FAIL}")
        print(f"  Success rate: {PASS/total*100:.0f}%\n" if total else "")

        if FAIL == 0:
            print("  🎉 ALL TESTS PASSED!")
        else:
            print(f"  ⚠️  {FAIL} test(s) need attention")

        return FAIL == 0


if __name__ == "__main__":
    success = asyncio.run(run_tests())
    sys.exit(0 if success else 1)
