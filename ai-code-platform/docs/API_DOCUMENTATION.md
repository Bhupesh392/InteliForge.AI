# AI Code Platform API Documentation

## Overview

The AI Code Platform API provides comprehensive endpoints for AI-powered code generation, testing, review, and documentation. This RESTful API is built with FastAPI and supports multiple programming languages.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All API endpoints require authentication using Bearer tokens:

```http
Authorization: Bearer <your-api-token>
```

## Endpoints

### 1. Code Generation

#### Generate Code from Description

**POST** `/generate-code`

Generate code from natural language descriptions with context awareness.

**Request Body:**
```json
{
  "description": "Create a function to sort a list of dictionaries by a specific key",
  "language": "python",
  "context": {
    "framework": "Django",
    "style": "functional"
  },
  "project_structure": {
    "main.py": "import pandas as pd\nclass DataProcessor:\n    pass",
    "utils.py": "def helper():\n    pass"
  },
  "requirements": ["error handling", "type hints"],
  "style_preferences": {
    "max_line_length": 88,
    "use_docstrings": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "code": "def sort_dicts_by_key(data: List[Dict], key: str, reverse: bool = False) -> List[Dict]:\n    \"\"\"Sort a list of dictionaries by a specific key.\"\"\"\n    try:\n        return sorted(data, key=lambda x: x.get(key), reverse=reverse)\n    except (TypeError, KeyError) as e:\n        raise ValueError(f\"Error sorting by key '{key}': {e}\")",
  "explanation": "This function sorts a list of dictionaries by a specified key with error handling and type hints.",
  "confidence": 0.92,
  "suggestions": [
    "Consider adding unit tests",
    "Add validation for empty lists"
  ],
  "estimated_time_saved": 15
}
```

### 2. Test Generation

#### Generate Tests for Code

**POST** `/generate-tests`

Generate comprehensive test cases for given code with coverage analysis.

**Request Body:**
```json
{
  "code": "def calculate_fibonacci(n):\n    if n <= 1:\n        return n\n    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)",
  "language": "python",
  "test_type": "unit",
  "coverage_target": 0.85,
  "existing_tests": "# Existing test code here",
  "test_framework": "pytest"
}
```

**Response:**
```json
{
  "success": true,
  "tests": "import pytest\n\ndef test_fibonacci_base_cases():\n    assert calculate_fibonacci(0) == 0\n    assert calculate_fibonacci(1) == 1\n\ndef test_fibonacci_recursive():\n    assert calculate_fibonacci(5) == 5\n    assert calculate_fibonacci(10) == 55",
  "coverage_analysis": {
    "target_coverage": 0.85,
    "estimated_coverage": 0.90,
    "testable_functions": 1,
    "testable_classes": 0,
    "total_testable_items": 1,
    "recommendations": [
      "Add tests for edge cases",
      "Test error handling paths"
    ]
  },
  "mocks": [
    "# Mock for external dependencies"
  ],
  "test_count": 3,
  "estimated_coverage": 0.90
}
```

### 3. Code Review

#### Review Code Quality

**POST** `/review-code`

Perform intelligent code review with bug detection and optimization suggestions.

**Request Body:**
```json
{
  "code": "def process_data(data):\n    result = []\n    for item in data:\n        if item > 0:\n            result.append(item * 2)\n    return result",
  "language": "python",
  "context": {
    "project_type": "data_processing",
    "performance_critical": true
  },
  "coding_standards": {
    "max_complexity": 10,
    "require_docstrings": true,
    "require_type_hints": true
  },
  "focus_areas": ["performance", "security", "maintainability"],
  "severity_threshold": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "issues": [
    {
      "line_number": 1,
      "severity": "medium",
      "category": "maintainability",
      "title": "Missing Type Hints",
      "description": "Function lacks type hints for parameters and return value",
      "suggestion": "Add type hints: def process_data(data: List[int]) -> List[int]:",
      "code_snippet": "def process_data(data):"
    },
    {
      "line_number": 1,
      "severity": "low",
      "category": "style",
      "title": "Missing Docstring",
      "description": "Function missing docstring",
      "suggestion": "Add docstring to document function purpose",
      "code_snippet": "def process_data(data):"
    }
  ],
  "suggestions": [
    "Consider using list comprehension for better performance",
    "Add input validation for robustness",
    "Consider using numpy for large datasets"
  ],
  "quality_score": 7.5,
  "security_analysis": {
    "total_security_issues": 0,
    "critical_issues": 0,
    "high_issues": 0,
    "security_score": 10,
    "recommendations": [
      "Implement input validation",
      "Use secure coding practices"
    ]
  },
  "performance_analysis": {
    "performance_issues": 1,
    "optimization_opportunities": 1,
    "performance_score": 8.0,
    "recommendations": [
      "Use list comprehension instead of loop",
      "Consider vectorized operations for large datasets"
    ]
  },
  "maintainability_score": 6.5
}
```

### 4. Documentation Generation

#### Generate Documentation

**POST** `/generate-docs`

Generate comprehensive documentation from code.

**Request Body:**
```json
{
  "code": "class UserManager:\n    def create_user(self, username, email):\n        pass\n    def delete_user(self, user_id):\n        pass",
  "language": "python",
  "doc_type": "api",
  "include_examples": true,
  "target_audience": "developers"
}
```

**Response:**
```json
{
  "success": true,
  "documentation": "# UserManager API\n\n## Overview\nThe UserManager class provides methods for user management operations.\n\n## Methods\n\n### create_user(username, email)\nCreates a new user with the specified username and email.\n\n**Parameters:**\n- `username` (str): The username for the new user\n- `email` (str): The email address for the new user\n\n**Example:**\n```python\nmanager = UserManager()\nmanager.create_user('john_doe', 'john@example.com')\n```",
  "doc_type": "api",
  "completeness_score": 0.85
}
```

### 5. Health Check

#### Check API Health

**GET** `/health`

Check the health status of the API and its services.

**Response:**
```json
{
  "status": "healthy",
  "services": ["code_generator", "test_generator", "code_reviewer"],
  "version": "1.0.0",
  "uptime": 3600
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "language",
      "issue": "Unsupported language: 'cobol'"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHENTICATION_ERROR`: Invalid or missing authentication token
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: AI service temporarily unavailable
- `INTERNAL_ERROR`: Unexpected server error

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1000 requests per hour
- **Enterprise**: Custom limits

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Supported Languages

The API supports the following programming languages:

- Python
- JavaScript
- TypeScript
- Java
- C++
- Go
- Rust
- C#
- PHP

## SDKs and Libraries

Official SDKs are available for:

- **Python**: `pip install ai-code-platform-sdk`
- **JavaScript/Node.js**: `npm install ai-code-platform-sdk`
- **VS Code Extension**: Available in the marketplace

## Examples

### Python SDK Usage

```python
from ai_code_platform import AICodePlatform

client = AICodePlatform(api_key="your-api-key")

# Generate code
result = client.generate_code(
    description="Create a REST API endpoint",
    language="python",
    context={"framework": "FastAPI"}
)

print(result.code)
```

### JavaScript SDK Usage

```javascript
import { AICodePlatform } from 'ai-code-platform-sdk';

const client = new AICodePlatform({ apiKey: 'your-api-key' });

// Generate tests
const result = await client.generateTests({
  code: 'function add(a, b) { return a + b; }',
  language: 'javascript',
  testType: 'unit'
});

console.log(result.tests);
```

## Webhooks

Configure webhooks to receive notifications about long-running operations:

```json
{
  "url": "https://your-app.com/webhooks/ai-code-platform",
  "events": ["code_generation_complete", "review_complete"],
  "secret": "your-webhook-secret"
}
```

## Support

- **Documentation**: https://docs.ai-code-platform.com
- **Support Email**: support@ai-code-platform.com
- **GitHub Issues**: https://github.com/ai-code-platform/issues
- **Discord Community**: https://discord.gg/ai-code-platform