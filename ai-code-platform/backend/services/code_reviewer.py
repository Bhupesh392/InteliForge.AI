import ast
import re
import asyncio
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import openai

from core.config import settings

class IssueSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueCategory(Enum):
    BUG = "bug"
    SECURITY = "security"
    PERFORMANCE = "performance"
    MAINTAINABILITY = "maintainability"
    STYLE = "style"
    BEST_PRACTICE = "best_practice"

@dataclass
class CodeIssue:
    line_number: int
    severity: IssueSeverity
    category: IssueCategory
    title: str
    description: str
    suggestion: str
    code_snippet: str

@dataclass
class SecurityFinding:
    vulnerability_type: str
    severity: IssueSeverity
    line_number: int
    description: str
    remediation: str

@dataclass
class CodeReviewResult:
    issues: List[CodeIssue]
    suggestions: List[str]
    quality_score: float
    security_analysis: Dict
    performance_analysis: Dict
    maintainability_score: float

class StaticAnalyzer:
    def __init__(self):
        self.security_patterns = {
            'sql_injection': [
                r'execute\s*\(\s*["\'].*%.*["\']',
                r'cursor\.execute\s*\(\s*["\'].*\+.*["\']',
                r'query\s*=\s*["\'].*%.*["\']'
            ],
            'xss': [
                r'innerHTML\s*=\s*.*\+',
                r'document\.write\s*\(',
                r'eval\s*\('
            ],
            'hardcoded_secrets': [
                r'password\s*=\s*["\'][^"\']+["\']',
                r'api_key\s*=\s*["\'][^"\']+["\']',
                r'secret\s*=\s*["\'][^"\']+["\']'
            ],
            'path_traversal': [
                r'open\s*\(\s*.*\+.*\)',
                r'file\s*=\s*.*\+.*'
            ]
        }
    
    def analyze_python_code(self, code: str) -> List[CodeIssue]:
        """Perform static analysis on Python code"""
        issues = []
        lines = code.split('\n')
        
        try:
            tree = ast.parse(code)
            issues.extend(self._analyze_ast(tree, lines))
        except SyntaxError as e:
            issues.append(CodeIssue(
                line_number=e.lineno or 1,
                severity=IssueSeverity.HIGH,
                category=IssueCategory.BUG,
                title="Syntax Error",
                description=f"Syntax error: {e.msg}",
                suggestion="Fix the syntax error",
                code_snippet=lines[e.lineno - 1] if e.lineno and e.lineno <= len(lines) else ""
            ))
        
        # Security analysis
        issues.extend(self._analyze_security(code, lines))
        
        # Performance analysis
        issues.extend(self._analyze_performance(code, lines))
        
        # Style analysis
        issues.extend(self._analyze_style(code, lines))
        
        return issues
    
    def _analyze_ast(self, tree: ast.AST, lines: List[str]) -> List[CodeIssue]:
        """Analyze AST for code issues"""
        issues = []
        
        for node in ast.walk(tree):
            # Check for complex functions
            if isinstance(node, ast.FunctionDef):
                complexity = self._calculate_complexity(node)
                if complexity > 10:
                    issues.append(CodeIssue(
                        line_number=node.lineno,
                        severity=IssueSeverity.MEDIUM,
                        category=IssueCategory.MAINTAINABILITY,
                        title="High Complexity Function",
                        description=f"Function '{node.name}' has complexity {complexity}",
                        suggestion="Consider breaking down into smaller functions",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else ""
                    ))
            
            # Check for bare except clauses
            elif isinstance(node, ast.ExceptHandler):
                if node.type is None:
                    issues.append(CodeIssue(
                        line_number=node.lineno,
                        severity=IssueSeverity.MEDIUM,
                        category=IssueCategory.BEST_PRACTICE,
                        title="Bare Except Clause",
                        description="Using bare 'except:' clause",
                        suggestion="Specify exception types or use 'except Exception:'",
                        code_snippet=lines[node.lineno - 1] if node.lineno <= len(lines) else ""
                    ))
            
            # Check for unused variables
            elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                # This is a simplified check - in practice, you'd need more sophisticated analysis
                pass
        
        return issues
    
    def _analyze_security(self, code: str, lines: List[str]) -> List[CodeIssue]:
        """Analyze code for security vulnerabilities"""
        issues = []
        
        for vuln_type, patterns in self.security_patterns.items():
            for pattern in patterns:
                for i, line in enumerate(lines):
                    if re.search(pattern, line, re.IGNORECASE):
                        severity = IssueSeverity.HIGH if vuln_type in ['sql_injection', 'xss'] else IssueSeverity.MEDIUM
                        issues.append(CodeIssue(
                            line_number=i + 1,
                            severity=severity,
                            category=IssueCategory.SECURITY,
                            title=f"Potential {vuln_type.replace('_', ' ').title()}",
                            description=f"Code pattern suggests potential {vuln_type} vulnerability",
                            suggestion=self._get_security_suggestion(vuln_type),
                            code_snippet=line.strip()
                        ))
        
        return issues
    
    def _analyze_performance(self, code: str, lines: List[str]) -> List[CodeIssue]:
        """Analyze code for performance issues"""
        issues = []
        
        performance_patterns = {
            'inefficient_loop': r'for.*in.*range\(len\(',
            'string_concatenation': r'\+\s*=\s*["\']',
            'repeated_computation': r'for.*in.*:.*\n.*for.*in.*:'
        }
        
        for issue_type, pattern in performance_patterns.items():
            for i, line in enumerate(lines):
                if re.search(pattern, line):
                    issues.append(CodeIssue(
                        line_number=i + 1,
                        severity=IssueSeverity.LOW,
                        category=IssueCategory.PERFORMANCE,
                        title=f"Performance Issue: {issue_type.replace('_', ' ').title()}",
                        description=f"Potential performance issue detected",
                        suggestion=self._get_performance_suggestion(issue_type),
                        code_snippet=line.strip()
                    ))
        
        return issues
    
    def _analyze_style(self, code: str, lines: List[str]) -> List[CodeIssue]:
        """Analyze code style issues"""
        issues = []
        
        for i, line in enumerate(lines):
            # Line too long
            if len(line) > 88:
                issues.append(CodeIssue(
                    line_number=i + 1,
                    severity=IssueSeverity.LOW,
                    category=IssueCategory.STYLE,
                    title="Line Too Long",
                    description=f"Line exceeds 88 characters ({len(line)} chars)",
                    suggestion="Break line into multiple lines",
                    code_snippet=line[:50] + "..." if len(line) > 50 else line
                ))
            
            # Missing docstring for functions
            if line.strip().startswith('def ') and i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if not next_line.startswith('"""') and not next_line.startswith("'''"):
                    issues.append(CodeIssue(
                        line_number=i + 1,
                        severity=IssueSeverity.LOW,
                        category=IssueCategory.STYLE,
                        title="Missing Docstring",
                        description="Function missing docstring",
                        suggestion="Add docstring to document function purpose",
                        code_snippet=line.strip()
                    ))
        
        return issues
    
    def _calculate_complexity(self, node: ast.FunctionDef) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.Try, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity
    
    def _get_security_suggestion(self, vuln_type: str) -> str:
        """Get security remediation suggestion"""
        suggestions = {
            'sql_injection': "Use parameterized queries or ORM methods",
            'xss': "Sanitize user input and use safe DOM manipulation",
            'hardcoded_secrets': "Use environment variables or secure key management",
            'path_traversal': "Validate and sanitize file paths"
        }
        return suggestions.get(vuln_type, "Review code for security best practices")
    
    def _get_performance_suggestion(self, issue_type: str) -> str:
        """Get performance optimization suggestion"""
        suggestions = {
            'inefficient_loop': "Use enumerate() instead of range(len())",
            'string_concatenation': "Use list.join() for multiple concatenations",
            'repeated_computation': "Cache computed values or optimize algorithm"
        }
        return suggestions.get(issue_type, "Consider optimizing this code section")

class CodeReviewerService:
    def __init__(self):
        self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.static_analyzer = StaticAnalyzer()
    
    async def review_code(
        self,
        code: str,
        language: str,
        context: Optional[Dict] = None,
        standards: Optional[Dict] = None
    ) -> CodeReviewResult:
        """Perform comprehensive code review"""
        
        # Static analysis
        static_issues = []
        if language == "python":
            static_issues = self.static_analyzer.analyze_python_code(code)
        
        # AI-powered review
        ai_review = await self._ai_code_review(code, language, context, standards)
        
        # Combine results
        all_issues = static_issues + ai_review.get("issues", [])
        
        # Calculate quality score
        quality_score = self._calculate_quality_score(all_issues, code)
        
        # Security analysis
        security_analysis = self._analyze_security_comprehensive(all_issues)
        
        # Performance analysis
        performance_analysis = self._analyze_performance_comprehensive(all_issues)
        
        return CodeReviewResult(
            issues=all_issues,
            suggestions=ai_review.get("suggestions", []),
            quality_score=quality_score,
            security_analysis=security_analysis,
            performance_analysis=performance_analysis,
            maintainability_score=self._calculate_maintainability_score(all_issues, code)
        )
    
    async def _ai_code_review(self, code: str, language: str, context: Dict, standards: Dict) -> Dict:
        """Perform AI-powered code review"""
        prompt = f"""Perform a comprehensive code review for the following {language} code:

CODE:
```{language}
{code}
```

CONTEXT: {context or "No additional context provided"}
STANDARDS: {standards or "Use industry best practices"}

Please analyze for:
1. Code quality and maintainability
2. Performance optimizations
3. Security vulnerabilities
4. Best practice violations
5. Design patterns and architecture
6. Error handling
7. Testing considerations

Provide specific, actionable feedback with line numbers where applicable.
Format your response as structured feedback with clear categories.
"""
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": f"You are a senior {language} code reviewer with expertise in security, performance, and best practices."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=2500
            )
            
            # Parse AI response into structured format
            return self._parse_ai_review(response.choices[0].message.content)
        except Exception as e:
            return {"issues": [], "suggestions": [f"AI review failed: {str(e)}"]}
    
    def _parse_ai_review(self, content: str) -> Dict:
        """Parse AI review response into structured format"""
        # This is a simplified parser - in practice, you'd want more sophisticated parsing
        lines = content.split('\n')
        issues = []
        suggestions = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if "suggestion" in line.lower() or "recommend" in line.lower():
                suggestions.append(line)
            elif any(keyword in line.lower() for keyword in ["issue", "problem", "concern", "vulnerability"]):
                # Try to extract line number if present
                line_match = re.search(r'line\s+(\d+)', line, re.IGNORECASE)
                line_number = int(line_match.group(1)) if line_match else 1
                
                # Determine severity and category based on keywords
                severity = IssueSeverity.MEDIUM
                category = IssueCategory.BEST_PRACTICE
                
                if any(word in line.lower() for word in ["critical", "severe", "security"]):
                    severity = IssueSeverity.HIGH
                    category = IssueCategory.SECURITY
                elif any(word in line.lower() for word in ["performance", "slow", "inefficient"]):
                    category = IssueCategory.PERFORMANCE
                
                issues.append(CodeIssue(
                    line_number=line_number,
                    severity=severity,
                    category=category,
                    title="AI Review Finding",
                    description=line,
                    suggestion="Review and address this finding",
                    code_snippet=""
                ))
        
        return {"issues": issues, "suggestions": suggestions}
    
    def _calculate_quality_score(self, issues: List[CodeIssue], code: str) -> float:
        """Calculate overall code quality score (0-10)"""
        if not code.strip():
            return 0.0
        
        # Base score
        score = 10.0
        
        # Deduct points based on issues
        for issue in issues:
            if issue.severity == IssueSeverity.CRITICAL:
                score -= 2.0
            elif issue.severity == IssueSeverity.HIGH:
                score -= 1.5
            elif issue.severity == IssueSeverity.MEDIUM:
                score -= 1.0
            else:
                score -= 0.5
        
        # Bonus for good practices (simplified)
        lines = code.split('\n')
        if any('"""' in line or "'''" in line for line in lines):
            score += 0.5  # Has docstrings
        
        if 'try:' in code and 'except' in code:
            score += 0.3  # Has error handling
        
        return max(0.0, min(10.0, score))
    
    def _analyze_security_comprehensive(self, issues: List[CodeIssue]) -> Dict:
        """Comprehensive security analysis"""
        security_issues = [issue for issue in issues if issue.category == IssueCategory.SECURITY]
        
        return {
            "total_security_issues": len(security_issues),
            "critical_issues": len([i for i in security_issues if i.severity == IssueSeverity.CRITICAL]),
            "high_issues": len([i for i in security_issues if i.severity == IssueSeverity.HIGH]),
            "security_score": max(0, 10 - len(security_issues) * 2),
            "recommendations": [
                "Implement input validation",
                "Use secure coding practices",
                "Regular security audits",
                "Keep dependencies updated"
            ]
        }
    
    def _analyze_performance_comprehensive(self, issues: List[CodeIssue]) -> Dict:
        """Comprehensive performance analysis"""
        perf_issues = [issue for issue in issues if issue.category == IssueCategory.PERFORMANCE]
        
        return {
            "performance_issues": len(perf_issues),
            "optimization_opportunities": len(perf_issues),
            "performance_score": max(0, 10 - len(perf_issues) * 1.5),
            "recommendations": [
                "Profile critical code paths",
                "Optimize database queries",
                "Use appropriate data structures",
                "Consider caching strategies"
            ]
        }
    
    def _calculate_maintainability_score(self, issues: List[CodeIssue], code: str) -> float:
        """Calculate maintainability score"""
        maintainability_issues = [
            issue for issue in issues 
            if issue.category in [IssueCategory.MAINTAINABILITY, IssueCategory.STYLE]
        ]
        
        base_score = 10.0
        for issue in maintainability_issues:
            base_score -= 0.5
        
        # Factor in code length and complexity
        lines = len([line for line in code.split('\n') if line.strip()])
        if lines > 500:
            base_score -= 1.0
        
        return max(0.0, min(10.0, base_score))