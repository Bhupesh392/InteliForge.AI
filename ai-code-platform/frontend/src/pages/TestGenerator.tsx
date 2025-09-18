import React, { useState } from 'react';
import { TestTube, Target, BarChart } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const TestGenerator: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [testType, setTestType] = useState('unit');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const languages = [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'csharp', 'php'
  ];

  const testTypes = [
    { value: 'unit', label: 'Unit Tests' },
    { value: 'integration', label: 'Integration Tests' },
    { value: 'e2e', label: 'End-to-End Tests' }
  ];

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateTests({
        code,
        language,
        test_type: testType
      });
      setResult(response);
      toast.success('Tests generated successfully!');
    } catch (error) {
      toast.error('Failed to generate tests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exampleCode = `def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True`;

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
            <TestTube size={32} style={{ color: '#f093fb' }} />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#333'
            }}>
              Smart Test Generator
            </h1>
          </div>

          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Paste your code below and we'll generate comprehensive test suites automatically.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
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
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#333'
              }}>
                Test Type:
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="input-field"
              >
                {testTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
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
              Your Code:
            </label>
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              title="Source Code"
            />
          </div>

          <button
            onClick={handleGenerate}
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
                Generating Tests...
              </>
            ) : (
              <>
                <TestTube size={20} />
                Generate Tests
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="fade-in">
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '2rem'
              }}>
                Generated Tests
              </h2>
              
              <CodeEditor
                code={result.tests}
                language={language}
                readOnly
                title={`${testType.charAt(0).toUpperCase() + testType.slice(1)} Tests`}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
              }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(240, 147, 251, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(240, 147, 251, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <Target size={20} style={{ color: '#f093fb' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                      Test Coverage
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#f093fb'
                  }}>
                    {Math.round(result.estimated_coverage * 100)}%
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Estimated coverage
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(79, 172, 254, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(79, 172, 254, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <BarChart size={20} style={{ color: '#4facfe' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                      Test Count
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#4facfe'
                  }}>
                    {result.test_count}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Generated tests
                  </p>
                </div>

                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(0, 184, 148, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 184, 148, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <TestTube size={20} style={{ color: '#00b894' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                      Functions
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#00b894'
                  }}>
                    {result.coverage_analysis.testable_functions}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Testable functions
                  </p>
                </div>
              </div>

              {result.mocks && result.mocks.length > 0 && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'rgba(255, 193, 7, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 193, 7, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    Recommended Mocks
                  </h3>
                  <ul style={{ color: '#666', lineHeight: '1.6' }}>
                    {result.mocks.map((mock: string, index: number) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {mock}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGenerator;