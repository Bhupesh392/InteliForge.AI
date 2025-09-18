import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data

def test_generate_code():
    """Test code generation endpoint"""
    payload = {
        "description": "create a hello world function",
        "language": "python"
    }
    response = client.post("/api/v1/generate-code", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "code" in data
    assert "explanation" in data

def test_generate_tests():
    """Test test generation endpoint"""
    payload = {
        "code": "def hello():\n    return 'Hello World'",
        "language": "python"
    }
    response = client.post("/api/v1/generate-tests", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "tests" in data

def test_review_code():
    """Test code review endpoint"""
    payload = {
        "code": "def hello():\n    return 'Hello World'",
        "language": "python"
    }
    response = client.post("/api/v1/review-code", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "quality_score" in data