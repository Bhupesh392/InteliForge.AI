import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, Bot, TestTube, FileText, BarChart3, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/generate', label: 'Generate Code', icon: Code },
    { path: '/test', label: 'Generate Tests', icon: TestTube },
    { path: '/review', label: 'Code Review', icon: FileText },
  ];

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: '#333',
          fontSize: '1.5rem',
          fontWeight: '700'
        }}>
          <Bot size={32} style={{ color: '#667eea' }} />
          AI Code Platform
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#333',
            padding: '0.5rem'
          }}
          className="mobile-menu-btn"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : '#666',
                  fontWeight: isActive ? '600' : '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile navigation */}
        <div 
          style={{
            display: isMenuOpen ? 'flex' : 'none',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            flexDirection: 'column',
            padding: '1rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            gap: '0.5rem'
          }}
          className="mobile-nav"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : '#666',
                  fontWeight: isActive ? '600' : '500',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;