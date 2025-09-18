import React, { useState } from 'react';
import { Wand2, Lightbulb, TrendingUp } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const CodeGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const languages = [
    'python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'csharp', 'php'
  ];

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateCode({
        description,
        language
      });
      setResult(response);
      toast.success('Code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate code');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'Create a function to calculate fibonacci numbers',
    'Build a REST API endpoint for user authentication',
    'Implement a binary search algorithm',
    'Create a React component for a todo list'
  ];

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
            <Wand2 size={32} style={{ color: '#667eea' }} />
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#333'
            }}>
              AI Code Generator
            </h1>
          </div>

          <p style={{
            color: '#666',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Describe what you want to build, and our AI will generate high-quality code for you.
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
                Describe what you want to build:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Create a function that sorts an array of objects by a specific property"
                className="textarea-field"
                style={{ minHeight: '120px' }}
              />
            </div>

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
                style={{ width: '150px' }}
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              marginBottom: '1rem'
            }}>
              Try these examples:
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setDescription(example)}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
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
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate Code
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
                marginBottom: '1rem'
              }}>
                Generated Code
              </h2>
              
              <CodeEditor
                code={result.code}
                language={language}
                readOnly
                title={`${language.charAt(0).toUpperCase() + language.slice(1)} Code`}
              />

              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <Lightbulb size={20} style={{ color: '#667eea' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                    Explanation
                  </h3>
                </div>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {result.explanation}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                marginTop: '2rem'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <TrendingUp size={20} style={{ color: '#00b894' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                      Confidence Score
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#00b894'
                  }}>
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>

                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    Suggestions
                  </h3>
                  <ul style={{ color: '#666', lineHeight: '1.6' }}>
                    {result.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;