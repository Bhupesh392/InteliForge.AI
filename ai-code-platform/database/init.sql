-- AI Code Platform Database Initialization

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ai_code_platform;

-- Use the database
\c ai_code_platform;

-- Create tables for future use
CREATE TABLE IF NOT EXISTS code_generations (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    generated_code TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_generations (
    id SERIAL PRIMARY KEY,
    source_code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    test_code TEXT NOT NULL,
    coverage_estimate FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS code_reviews (
    id SERIAL PRIMARY KEY,
    source_code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    quality_score FLOAT DEFAULT 0.0,
    issues_found INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO code_generations (description, language, generated_code, confidence) VALUES
('Hello world function', 'python', 'def hello_world():\n    print("Hello, World!")\n    return "Hello, World!"', 0.95);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_generations_language ON code_generations(language);
CREATE INDEX IF NOT EXISTS idx_test_generations_language ON test_generations(language);
CREATE INDEX IF NOT EXISTS idx_code_reviews_language ON code_reviews(language);