import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CodeGenerator from './pages/CodeGenerator';
import TestGenerator from './pages/TestGenerator';
import CodeReviewer from './pages/CodeReviewer';

function App() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<CodeGenerator />} />
        <Route path="/test" element={<TestGenerator />} />
        <Route path="/review" element={<CodeReviewer />} />
      </Routes>
    </div>
  );
}

export default App;