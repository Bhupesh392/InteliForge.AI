import asyncio
from typing import Dict, List, Optional
from dataclasses import dataclass
import openai
import anthropic
from tree_sitter import Language, Parser
import tree_sitter_python as tspython

from core.config import settings

@dataclass
class CodeGenerationResult:
    code: str
    explanation: str
    language: str
    confidence: float
    suggestions: List[str]

class ContextAnalyzer:
    def __init__(self):
        self.parsers = {}
        self._init_parsers()
    
    def _init_parsers(self):
        PY_LANGUAGE = Language(tspython.language(), "python")
        parser = Parser()
        parser.set_language(PY_LANGUAGE)
        self.parsers["python"] = parser
    
    def analyze_project_structure(self, files: Dict[str, str]) -> Dict:
        """Analyze project structure and extract patterns"""
        structure = {
            "imports": set(),
            "classes": [],
            "functions": [],
            "patterns": [],
            "dependencies": set()
        }
        
        for filename, content in files.items():
            if filename.endswith('.py'):
                tree = self.parsers["python"].parse(bytes(content, "utf8"))
                self._extract_python_patterns(tree.root_node, structure)
        
        return {k: list(v) if isinstance(v, set) else v for k, v in structure.items()}
    
    def _extract_python_patterns(self, node, structure):
        """Extract patterns from Python AST"""
        if node.type == "import_statement" or node.type == "import_from_statement":
            structure["imports"].add(node.text.decode())
        elif node.type == "class_definition":
            class_name = self._get_node_name(node)
            if class_name:
                structure["classes"].append(class_name)
        elif node.type == "function_definition":
            func_name = self._get_node_name(node)
            if func_name:
                structure["functions"].append(func_name)
        
        for child in node.children:
            self._extract_python_patterns(child, structure)
    
    def _get_node_name(self, node):
        for child in node.children:
            if child.type == "identifier":
                return child.text.decode()
        return None

class CodeGeneratorService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.context_analyzer = ContextAnalyzer()
    
    async def generate_code(
        self,
        description: str,
        language: str,
        context: Optional[Dict] = None,
        project_structure: Optional[Dict[str, str]] = None
    ) -> CodeGenerationResult:
        """Generate code from natural language with context awareness"""
        
        # Analyze project context if provided
        project_context = {}
        if project_structure:
            project_context = self.context_analyzer.analyze_project_structure(project_structure)
        
        # Build context-aware prompt
        prompt = self._build_generation_prompt(description, language, context, project_context)
        
        # Generate code using AI model
        if language in ["python", "javascript", "typescript"]:
            result = await self._generate_with_openai(prompt, language)
        else:
            result = await self._generate_with_anthropic(prompt, language)
        
        return result
    
    def _build_generation_prompt(self, description: str, language: str, context: Dict, project_context: Dict) -> str:
        """Build context-aware prompt for code generation"""
        prompt = f"""Generate {language} code for the following requirement:

REQUIREMENT: {description}

CONTEXT:
"""
        
        if project_context.get("imports"):
            prompt += f"Existing imports: {', '.join(project_context['imports'][:5])}\n"
        
        if project_context.get("classes"):
            prompt += f"Existing classes: {', '.join(project_context['classes'][:5])}\n"
        
        if project_context.get("functions"):
            prompt += f"Existing functions: {', '.join(project_context['functions'][:5])}\n"
        
        if context:
            prompt += f"Additional context: {context}\n"
        
        prompt += f"""
REQUIREMENTS:
1. Generate clean, production-ready {language} code
2. Follow best practices and coding standards
3. Include proper error handling
4. Add meaningful comments
5. Ensure code is testable and maintainable
6. Use existing project patterns when applicable

Provide the code with a brief explanation of the implementation approach.
"""
        
        return prompt
    
    async def _generate_with_openai(self, prompt: str, language: str) -> CodeGenerationResult:
        """Generate code using OpenAI GPT-4"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"You are an expert {language} developer. Generate high-quality, production-ready code."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            code, explanation = self._parse_ai_response(content)
            
            return CodeGenerationResult(
                code=code,
                explanation=explanation,
                language=language,
                confidence=0.9,
                suggestions=["Consider adding unit tests", "Review error handling"]
            )
        except Exception as e:
            raise Exception(f"OpenAI generation failed: {str(e)}")
    
    async def _generate_with_anthropic(self, prompt: str, language: str) -> CodeGenerationResult:
        """Generate code using Anthropic Claude"""
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                temperature=0.2,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            code, explanation = self._parse_ai_response(content)
            
            return CodeGenerationResult(
                code=code,
                explanation=explanation,
                language=language,
                confidence=0.85,
                suggestions=["Validate input parameters", "Add logging"]
            )
        except Exception as e:
            raise Exception(f"Anthropic generation failed: {str(e)}")
    
    def _parse_ai_response(self, content: str) -> tuple[str, str]:
        """Parse AI response to extract code and explanation"""
        lines = content.split('\n')
        code_lines = []
        explanation_lines = []
        in_code_block = False
        
        for line in lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                continue
            
            if in_code_block:
                code_lines.append(line)
            else:
                explanation_lines.append(line)
        
        code = '\n'.join(code_lines).strip()
        explanation = '\n'.join(explanation_lines).strip()
        
        return code, explanation