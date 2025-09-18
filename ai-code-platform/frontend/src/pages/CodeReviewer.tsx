import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Shield, Zap, Wrench } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { CodeIssue } from '../types/api';

const CodeReviewer: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const languages = [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'csharp', 'php'
  ];

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.reviewCode({
        code,
        language
      });
      setResult(response);
      toast.success('Code review completed!');
    } catch (error) {
      toast.error('Failed to review code');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#e17055';
      case 'medium': return '#fdcb6e';
      case 'low': return '#00b894';
      default: return '#74b9ff';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      case 'low': return CheckCircle;
      default: return CheckCircle;
    }
  };

  const exampleCode = `def process_user_data(user_input):
    # Potential security issue: no input validation
    query = "SELECT * FROM users WHERE name = '" + user_input + "'"
    
    # Performance issue: inefficient loop
    results = []
    for i in range(len(data)):
        if data[i].active:
            results.append(data[i])
    
    return results

# Missing error handling
def divide_numbers(a, b):
    return a / b`;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <FileText size={32} style={{ color: '#4facfe' }} />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#333'
            }}>
              Code Review & Analysis
            </h1>
          </div>

          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Get comprehensive code reviews with security, performance, and quality insights.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#333'
              }}>
                Language:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
                style={{ width: '200px' }}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ alignSelf: 'end' }}>
              <button
                onClick={() => setCode(exampleCode)}
                className="btn-secondary"
              >
                Load Example
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#333'
            }}>
              Code to Review:
            </label>
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              title="Source Code"
            />
          </div>

          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              padding: '1rem 2rem'
            }}
          >
            {loading ? (
              <>
                <div className="loading" />
                Analyzing Code...
              </>
            ) : (
              <>
                <FileText size={20} />
                Review Code
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="fade-in">
            {/* Quality Scores */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '2rem'
              }}>
                Quality Analysis
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(79, 172, 254, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(79, 172, 254, 0.1)',
                  textAlign: 'center'
                }}>
                  <Shield size={32} style={{ color: '#4facfe', marginBottom: '0.5rem' }} />
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#4facfe'
                  }}>
                    {result.security_analysis.security_score}/10
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Security Score
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(0, 184, 148, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 184, 148, 0.1)',
                  textAlign: 'center'
                }}>
                  <Zap size={32} style={{ color: '#00b894', marginBottom: '0.5rem' }} />
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#00b894'
                  }}>
                    {result.performance_analysis.performance_score}/10
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Performance Score
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(253, 203, 110, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(253, 203, 110, 0.1)',
                  textAlign: 'center'
                }}>
                  <Wrench size={32} style={{ color: '#fdcb6e', marginBottom: '0.5rem' }} />
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#fdcb6e'
                  }}>
                    {result.maintainability_score}/10
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Maintainability
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  textAlign: 'center'
                }}>
                  <CheckCircle size={32} style={{ color: '#667eea', marginBottom: '0.5rem' }} />
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#667eea'
                  }}>
                    {result.quality_score}/10
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Overall Quality
                  </p>
                </div>
              </div>
            </div>

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '2rem'
                }}>
                  Issues Found ({result.issues.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.issues.map((issue: CodeIssue, index: number) => {
                    const SeverityIcon = getSeverityIcon(issue.severity);
                    const severityColor = getSeverityColor(issue.severity);

                    return (
                      <div
                        key={index}
                        style={{
                          padding: '1.5rem',
                          border: `1px solid ${severityColor}20`,
                          borderLeft: `4px solid ${severityColor}`,
                          borderRadius: '8px',
                          background: `${severityColor}05`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}>
                          <SeverityIcon size={20} style={{ color: severityColor, marginTop: '0.25rem' }} />
                          
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              marginBottom: '0.5rem'
                            }}>
                              <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#333'
                              }}>
                                {issue.title}
                              </h3>
                              <span style={{
                                background: severityColor,
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {issue.severity}
                              </span>
                              <span style={{
                                background: 'rgba(0, 0, 0, 0.1)',
                                color: '#666',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                              }}>
                                Line {issue.line_number}
                              </span>
                            </div>
                            
                            <p style={{
                              color: '#666',
                              marginBottom: '1rem',
                              lineHeight: '1.6'
                            }}>
                              {issue.description}
                            </p>
                            
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.7)',
                              padding: '1rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                              <strong style={{ color: '#333', fontSize: '0.9rem' }}>
                                Suggestion:
                              </strong>
                              <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                                {issue.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Suggestions */}
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '2rem'
                }}>
                  General Recommendations
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {result.suggestions.map((suggestion: string, index: number) => (
                    <div
                      key={index}
                      style={{
                        padding: '1rem',
                        background: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <CheckCircle size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>
                        {suggestion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeReviewer;