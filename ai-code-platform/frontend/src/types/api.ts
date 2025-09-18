export interface CodeGenerationRequest {
  description: string;
  language: string;
  context?: Record<string, any>;
}

export interface CodeGenerationResponse {
  success: boolean;
  code: string;
  explanation: string;
  confidence: number;
  suggestions: string[];
}

export interface TestGenerationRequest {
  code: string;
  language: string;
  test_type?: string;
}

export interface TestGenerationResponse {
  success: boolean;
  tests: string;
  coverage_analysis: {
    estimated_coverage: number;
    testable_functions: number;
    test_count: number;
  };
  mocks: any[];
  test_count: number;
  estimated_coverage: number;
}

export interface CodeReviewRequest {
  code: string;
  language: string;
}

export interface CodeIssue {
  line_number: number;
  severity: 'low' | 'medium' | 'high';
  category: string;
  title: string;
  description: string;
  suggestion: string;
}

export interface CodeReviewResponse {
  success: boolean;
  issues: CodeIssue[];
  suggestions: string[];
  quality_score: number;
  security_analysis: {
    total_security_issues: number;
    security_score: number;
  };
  performance_analysis: {
    performance_score: number;
    optimization_opportunities: number;
  };
  maintainability_score: number;
}

export interface HealthResponse {
  status: string;
  services: string[];
}