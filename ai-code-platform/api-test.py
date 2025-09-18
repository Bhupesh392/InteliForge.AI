#!/usr/bin/env python3
"""
API Testing Script for AI Code Platform
Run this to test all API endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_code_generation():
    """Test code generation endpoint"""
    print("🔍 Testing code generation...")
    payload = {
        "description": "create a hello world function",
        "language": "python"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/v1/generate-code", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "code" in data:
                print("✅ Code generation passed")
                return True
        print(f"❌ Code generation failed: {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Code generation error: {e}")
        return False

def test_test_generation():
    """Test test generation endpoint"""
    print("🔍 Testing test generation...")
    payload = {
        "code": "def hello():\n    return 'Hello World'",
        "language": "python"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/v1/generate-tests", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "tests" in data:
                print("✅ Test generation passed")
                return True
        print(f"❌ Test generation failed: {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Test generation error: {e}")
        return False

def test_code_review():
    """Test code review endpoint"""
    print("🔍 Testing code review...")
    payload = {
        "code": "def hello():\n    return 'Hello World'",
        "language": "python"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/v1/review-code", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "quality_score" in data:
                print("✅ Code review passed")
                return True
        print(f"❌ Code review failed: {response.status_code}")
        return False
    except Exception as e:
        print(f"❌ Code review error: {e}")
        return False

def main():
    print("🚀 AI Code Platform API Testing")
    print("=" * 40)
    
    tests = [
        test_health,
        test_code_generation,
        test_test_generation,
        test_code_review
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()