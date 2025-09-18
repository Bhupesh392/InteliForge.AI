import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

test('renders AI Code Platform', () => {
  render(<AppWithRouter />);
  const linkElement = screen.getByText(/AI Code Platform/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<AppWithRouter />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Generate Code/i)).toBeInTheDocument();
  expect(screen.getByText(/Generate Tests/i)).toBeInTheDocument();
  expect(screen.getByText(/Code Review/i)).toBeInTheDocument();
});