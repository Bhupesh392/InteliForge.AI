import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, TestTube, FileText, Activity, Zap, Shield, Target } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('checking');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await apiService.healthCheck();
      setHealthStatus(response.status);
    } catch (error) {
      setHealthStatus('error');
      toast.error('Backend service is not available');
    }
  };

  const features = [
    {
      icon: Code,
      title: 'AI Code Generation',
      description: 'Generate high-quality code from natural language descriptions',
      link: '/generate',
      color: '#667eea'
    },
    {
      icon: TestTube,
      title: 'Smart Test Generation',
      description: 'Automatically create comprehensive test suites for your code',
      link: '/test',
      color: '#f093fb'
    },
    {
      icon: FileText,
      title: 'Code Review & Analysis',
      description: 'Get detailed code reviews with security and performance insights',
      link: '/review',
      color: '#4facfe'
    }
  ];

  const stats = [
    { icon: Zap, label: 'Performance', value: '95%', color: '#ffeaa7' },
    { icon: Shield, label: 'Security Score', value: '9.8/10', color: '#fd79a8' },
    { icon: Target, label: 'Accuracy', value: '98.5%', color: '#00b894' }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container">
        {/* Hero Section */}
        <div className="card fade-in" style={{
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            AI Code Platform
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
            padding: '0 1rem'
          }}>
            Supercharge your development workflow with AI-powered code generation, 
            testing, and review capabilities.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <Activity size={20} style={{ 
              color: healthStatus === 'healthy' ? '#00b894' : '#e17055' 
            }} />
            <span style={{
              color: healthStatus === 'healthy' ? '#00b894' : '#e17055',
              fontWeight: '500'
            }}>
              Backend Status: {healthStatus === 'healthy' ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'clamp(1rem, 3vw, 2rem)',
            marginTop: '2rem'
          }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Icon size={32} style={{ color: stat.color, marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(1rem, 3vw, 2rem)'
        }}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                style={{ textDecoration: 'none' }}
                className="fade-in"
              >
                <div className="card" style={{
                  padding: '2rem',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <Icon size={28} style={{ color: feature.color }} />
                  </div>
                  
                  <h3 style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '1rem'
                  }}>
                    {feature.title}
                  </h3>
                  
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6',
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)'
                  }}>
                    {feature.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Getting Started */}
        <div className="card fade-in" style={{
          padding: '2rem',
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
            fontWeight: '600',
            color: '#333',
            marginBottom: '1rem'
          }}>
            Ready to get started?
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)'
          }}>
            Choose a feature above to begin enhancing your development workflow with AI.
          </p>
          <Link to="/generate">
            <button className="btn-primary" style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              padding: 'clamp(0.8rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)'
            }}>
              Start Generating Code
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;