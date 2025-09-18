from dataclasses import dataclass
import openai
from core.config import settings

@dataclass
class DocumentationResult:
    documentation: str

class DocumentationService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_documentation(self, code: str, language: str, doc_type: str = "api"):
        prompt = f"Generate {doc_type} documentation for this {language} code:\n\n{code}"
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1500
            )
            
            return DocumentationResult(
                documentation=response.choices[0].message.content
            )
        except Exception as e:
            return DocumentationResult(
                documentation=f"# Documentation Generation Failed\n\nError: {str(e)}"
            )