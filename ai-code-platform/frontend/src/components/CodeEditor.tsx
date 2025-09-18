import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  code: string;
  language: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  title?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  readOnly = false,
  onChange,
  title
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  if (readOnly) {
    return (
      <div style={{
        background: '#1e1e1e',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {title && (
          <div style={{
            background: '#2d2d2d',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>
              {title}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
        <pre style={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '14px',
          color: '#fff',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'Fira Code, Monaco, Cascadia Code, Roboto Mono, monospace'
        }}>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {title && (
        <div style={{
          background: '#f8f9fa',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#333'
        }}>
          {title}
        </div>
      )}
      <textarea
        value={code}
        onChange={(e) => onChange?.(e.target.value)}
        className="textarea-field"
        style={{
          border: 'none',
          borderRadius: 0,
          fontFamily: 'Fira Code, Monaco, Cascadia Code, Roboto Mono, monospace',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        placeholder={`Enter your ${language} code here...`}
      />
    </div>
  );
};

export default CodeEditor;