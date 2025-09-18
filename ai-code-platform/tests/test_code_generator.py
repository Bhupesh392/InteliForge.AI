import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from backend.services.code_generator import CodeGeneratorService, CodeGenerationResult

class TestCodeGeneratorService:
    
    @pytest.fixture
    def service(self):
        with patch('backend.services.code_generator.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.ANTHROPIC_API_KEY = "test-key"
            return CodeGeneratorService()
    
    @pytest.mark.asyncio
    async def test_generate_python_code_success(self, service):
        """Test successful Python code generation"""
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = """
        Here's a Python function to sort a list:
        
        ```python
        def sort_list(items, reverse=False):
            \"\"\"Sort a list of items.\"\"\"
            return sorted(items, reverse=reverse)
        ```
        
        This function uses Python's built-in sorted() function.
        """
        
        with patch.object(service.openai_client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await service.generate_code(
                description="Create a function to sort a list",
                language="python"
            )
            
            assert isinstance(result, CodeGenerationResult)
            assert "def sort_list" in result.code
            assert result.language == "python"
            assert result.confidence > 0
            assert len(result.suggestions) > 0
    
    @pytest.mark.asyncio
    async def test_generate_code_with_context(self, service):
        """Test code generation with project context"""
        project_structure = {
            "main.py": "import pandas as pd\nclass DataProcessor:\n    pass",
            "utils.py": "def helper_function():\n    pass"
        }
        
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = """
        ```python
        def process_data(df):
            return df.dropna()
        ```
        """
        
        with patch.object(service.openai_client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await service.generate_code(
                description="Create a data processing function",
                language="python",
                project_structure=project_structure
            )
            
            assert "def process_data" in result.code
            # Verify context was analyzed
            mock_create.assert_called_once()
            call_args = mock_create.call_args[1]
            prompt = call_args['messages'][1]['content']
            assert "pandas" in prompt or "DataProcessor" in prompt
    
    @pytest.mark.asyncio
    async def test_generate_javascript_code(self, service):
        """Test JavaScript code generation using Anthropic"""
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = """
        Here's a JavaScript function:
        
        ```javascript
        function validateEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        }
        ```
        """
        
        with patch.object(service.anthropic_client.messages, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await service.generate_code(
                description="Create an email validation function",
                language="javascript"
            )
            
            assert "function validateEmail" in result.code
            assert result.language == "javascript"
    
    @pytest.mark.asyncio
    async def test_api_error_handling(self, service):
        """Test handling of API errors"""
        with patch.object(service.openai_client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.side_effect = Exception("API Error")
            
            with pytest.raises(Exception) as exc_info:
                await service.generate_code(
                    description="Test description",
                    language="python"
                )
            
            assert "OpenAI generation failed" in str(exc_info.value)
    
    def test_context_analyzer_python(self, service):
        """Test context analysis for Python code"""
        files = {
            "main.py": """
import pandas as pd
from utils import helper

class DataProcessor:
    def __init__(self):
        pass
    
    def process(self):
        return helper()

def main_function():
    pass
"""
        }
        
        analysis = service.context_analyzer.analyze_project_structure(files)
        
        assert "pandas" in str(analysis["imports"])
        assert "DataProcessor" in analysis["classes"]
        assert "main_function" in analysis["functions"]
    
    def test_prompt_building(self, service):
        """Test prompt building with context"""
        description = "Create a sorting function"
        language = "python"
        context = {"framework": "Django"}
        project_context = {
            "imports": ["django.db", "pandas"],
            "classes": ["Model", "View"],
            "functions": ["helper"]
        }
        
        prompt = service._build_generation_prompt(description, language, context, project_context)
        
        assert description in prompt
        assert language in prompt
        assert "django.db" in prompt
        assert "Model" in prompt
        assert "helper" in prompt
    
    def test_response_parsing(self, service):
        """Test parsing of AI responses"""
        content = """
        Here's the solution:
        
        ```python
        def test_function():
            return "Hello World"
        ```
        
        This function returns a greeting message.
        """
        
        code, explanation = service._parse_ai_response(content)
        
        assert "def test_function" in code
        assert "greeting message" in explanation
        assert "```" not in code  # Code blocks should be stripped

@pytest.mark.asyncio
async def test_integration_code_generation():
    """Integration test for the complete code generation flow"""
    with patch('backend.services.code_generator.settings') as mock_settings:
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.ANTHROPIC_API_KEY = "test-key"
        
        service = CodeGeneratorService()
        
        # Mock successful API response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = """
        ```python
        def fibonacci(n):
            if n <= 1:
                return n
            return fibonacci(n-1) + fibonacci(n-2)
        ```
        
        This is a recursive Fibonacci implementation.
        """
        
        with patch.object(service.openai_client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            
            result = await service.generate_code(
                description="Generate a Fibonacci function",
                language="python",
                context={"optimization": "recursive"}
            )
            
            # Verify result structure
            assert isinstance(result, CodeGenerationResult)
            assert result.code.strip().startswith("def fibonacci")
            assert "recursive" in result.explanation.lower()
            assert result.confidence >= 0.8
            assert len(result.suggestions) >= 2