import ast
import asyncio
from typing import Dict, List, Optional
from dataclasses import dataclass
import openai
from tree_sitter import Language, Parser
import tree_sitter_python as tspython

from core.config import settings

@dataclass
class TestGenerationResult:
    tests: str
    coverage_analysis: Dict
    mocks: List[str]
    test_count: int
    estimated_coverage: float

class TestAnalyzer:
    def __init__(self):
        self.PY_LANGUAGE = Language(tspython.language(), "python")
        self.parser = Parser()
        self.parser.set_language(self.PY_LANGUAGE)
    
    def analyze_code_structure(self, code: str, language: str) -> Dict:
        """Analyze code structure to identify testable components"""
        if language == "python":
            return self._analyze_python_code(code)
        elif language in ["javascript", "typescript"]:
            return self._analyze_js_code(code)
        else:
            return self._generic_analysis(code)
    
    def _analyze_python_code(self, code: str) -> Dict:
        """Analyze Python code structure"""
        try:
            tree = ast.parse(code)
            analysis = {
                "functions": [],
                "classes": [],
                "imports": [],
                "complexity": 0,
                "dependencies": []
            }
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    func_info = {
                        "name": node.name,
                        "args": [arg.arg for arg in node.args.args],
                        "returns": self._get_return_type(node),
                        "complexity": self._calculate_complexity(node),
                        "line_start": node.lineno,
                        "line_end": node.end_lineno or node.lineno
                    }
                    analysis["functions"].append(func_info)
                
                elif isinstance(node, ast.ClassDef):
                    class_info = {
                        "name": node.name,
                        "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)],
                        "line_start": node.lineno,
                        "line_end": node.end_lineno or node.lineno
                    }
                    analysis["classes"].append(class_info)
                
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            analysis["imports"].append(alias.name)
                    else:
                        analysis["imports"].append(node.module)
            
            return analysis
        except Exception as e:
            return {"error": str(e), "functions": [], "classes": [], "imports": []}
    
    def _analyze_js_code(self, code: str) -> Dict:
        """Basic JavaScript/TypeScript analysis"""
        lines = code.split('\n')
        functions = []
        classes = []
        imports = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line.startswith('function ') or 'function(' in line:
                func_name = self._extract_js_function_name(line)
                if func_name:
                    functions.append({"name": func_name, "line": i + 1})
            elif line.startswith('class '):
                class_name = line.split()[1].split('(')[0].split('{')[0]
                classes.append({"name": class_name, "line": i + 1})
            elif 'import' in line and 'from' in line:
                imports.append(line)
        
        return {
            "functions": functions,
            "classes": classes,
            "imports": imports,
            "complexity": len(functions) + len(classes)
        }
    
    def _generic_analysis(self, code: str) -> Dict:
        """Generic code analysis for unsupported languages"""
        lines = code.split('\n')
        return {
            "functions": [],
            "classes": [],
            "imports": [],
            "complexity": len([l for l in lines if l.strip()]),
            "line_count": len(lines)
        }
    
    def _get_return_type(self, node) -> str:
        """Extract return type annotation if available"""
        if hasattr(node, 'returns') and node.returns:
            if isinstance(node.returns, ast.Name):
                return node.returns.id
            elif isinstance(node.returns, ast.Constant):
                return str(node.returns.value)
        return "Any"
    
    def _calculate_complexity(self, node) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity
    
    def _extract_js_function_name(self, line: str) -> Optional[str]:
        """Extract function name from JavaScript line"""
        if 'function ' in line:
            parts = line.split('function ')
            if len(parts) > 1:
                name_part = parts[1].split('(')[0].strip()
                return name_part if name_part else None
        return None

class TestGeneratorService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.analyzer = TestAnalyzer()
    
    async def generate_tests(
        self,
        code: str,
        language: str,
        test_type: str = "unit",
        coverage_target: float = 0.8
    ) -> TestGenerationResult:
        """Generate comprehensive test cases for given code"""
        
        # Analyze code structure
        analysis = self.analyzer.analyze_code_structure(code, language)
        
        # Generate tests based on analysis
        if test_type == "unit":
            tests = await self._generate_unit_tests(code, language, analysis)
        elif test_type == "integration":
            tests = await self._generate_integration_tests(code, language, analysis)
        else:
            tests = await self._generate_comprehensive_tests(code, language, analysis)
        
        # Generate mocks for dependencies
        mocks = self._generate_mocks(analysis)
        
        # Calculate coverage analysis
        coverage_analysis = self._analyze_coverage(analysis, coverage_target)
        
        return TestGenerationResult(
            tests=tests,
            coverage_analysis=coverage_analysis,
            mocks=mocks,
            test_count=len(analysis.get("functions", [])) + len(analysis.get("classes", [])),
            estimated_coverage=min(coverage_target, 0.95)
        )
    
    async def _generate_unit_tests(self, code: str, language: str, analysis: Dict) -> str:
        """Generate unit tests for individual functions and methods"""
        prompt = f"""Generate comprehensive unit tests for the following {language} code:

CODE:
```{language}
{code}
```

ANALYSIS:
- Functions: {len(analysis.get('functions', []))}
- Classes: {len(analysis.get('classes', []))}
- Complexity: {analysis.get('complexity', 0)}

REQUIREMENTS:
1. Test all public functions and methods
2. Include edge cases and error conditions
3. Test boundary values and invalid inputs
4. Use appropriate testing framework ({self._get_test_framework(language)})
5. Include setup and teardown if needed
6. Add descriptive test names and comments
7. Achieve high code coverage

Generate complete, runnable test code with proper imports and structure.
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"You are an expert test engineer specializing in {language} testing."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=3000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"# Error generating tests: {str(e)}\n# Please check your API configuration"
    
    async def _generate_integration_tests(self, code: str, language: str, analysis: Dict) -> str:
        """Generate integration tests for component interactions"""
        prompt = f"""Generate integration tests for the following {language} code:

CODE:
```{language}
{code}
```

Focus on:
1. Testing interactions between components
2. Database operations (if applicable)
3. API endpoints (if applicable)
4. External service integrations
5. End-to-end workflows
6. Data flow validation

Use appropriate testing tools and frameworks for {language}.
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"You are an expert integration test engineer for {language}."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2500
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"# Error generating integration tests: {str(e)}"
    
    async def _generate_comprehensive_tests(self, code: str, language: str, analysis: Dict) -> str:
        """Generate both unit and integration tests"""
        unit_tests = await self._generate_unit_tests(code, language, analysis)
        integration_tests = await self._generate_integration_tests(code, language, analysis)
        
        return f"""# Comprehensive Test Suite

## Unit Tests
{unit_tests}

## Integration Tests
{integration_tests}
"""
    
    def _generate_mocks(self, analysis: Dict) -> List[str]:
        """Generate mock objects for external dependencies"""
        mocks = []
        
        # Generate mocks based on imports
        for import_name in analysis.get("imports", []):
            if any(ext in import_name.lower() for ext in ["requests", "http", "api", "database", "db"]):
                mock_code = f"""
# Mock for {import_name}
@patch('{import_name}')
def mock_{import_name.replace('.', '_')}():
    mock = MagicMock()
    mock.return_value = {{"status": "success", "data": {{}}}
    return mock
"""
                mocks.append(mock_code.strip())
        
        return mocks
    
    def _analyze_coverage(self, analysis: Dict, target: float) -> Dict:
        """Analyze potential test coverage"""
        total_functions = len(analysis.get("functions", []))
        total_classes = len(analysis.get("classes", []))
        total_testable = total_functions + total_classes
        
        if total_testable == 0:
            return {"coverage": 0, "testable_items": 0, "recommendations": ["No testable code found"]}
        
        estimated_coverage = min(target, 0.95)  # Cap at 95%
        
        return {
            "target_coverage": target,
            "estimated_coverage": estimated_coverage,
            "testable_functions": total_functions,
            "testable_classes": total_classes,
            "total_testable_items": total_testable,
            "recommendations": [
                "Add tests for all public methods",
                "Include edge case testing",
                "Test error handling paths",
                "Add performance tests for critical functions"
            ]
        }
    
    def _get_test_framework(self, language: str) -> str:
        """Get appropriate testing framework for language"""
        frameworks = {
            "python": "pytest",
            "javascript": "Jest",
            "typescript": "Jest",
            "java": "JUnit 5",
            "cpp": "Google Test",
            "go": "testing package",
            "rust": "built-in test framework",
            "csharp": "xUnit"
        }
        return frameworks.get(language, "appropriate testing framework")