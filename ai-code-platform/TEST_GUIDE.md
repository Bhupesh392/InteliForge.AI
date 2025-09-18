# 🧪 AI Code Platform Testing Guide

## 🚀 Quick Testing Steps

### 1. **Manual Testing (Recommended)**
```bash
# Start the application
run.bat  # Windows
# or
./run.sh  # Mac/Linux

# Test URLs:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### 2. **API Testing**
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Code generation
curl -X POST http://localhost:8000/api/v1/generate-code \
  -H "Content-Type: application/json" \
  -d '{"description": "create a hello world function", "language": "python"}'
```

### 3. **Frontend Testing**
- Navigate to http://localhost:3000
- Test all navigation links
- Try code generation with sample inputs
- Test mobile responsiveness (resize browser)

## 🔧 Automated Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📋 Test Scenarios

### ✅ **Must Test Features:**
1. **Dashboard loads correctly**
2. **Code Generator works with sample input**
3. **Test Generator processes code**
4. **Code Reviewer analyzes code**
5. **Mobile navigation works**
6. **API endpoints respond**

### 🎯 **Sample Test Data:**
- **Code Gen**: "Create a function to calculate fibonacci"
- **Test Gen**: Simple Python function
- **Code Review**: Function with potential issues

## 🐛 **Common Issues & Solutions:**
- **Port 3000 busy**: Use `set PORT=3001 && npm start`
- **Backend not responding**: Check if running on port 8000
- **CORS errors**: Backend CORS is configured for localhost

## ✅ **Success Criteria:**
- All pages load without errors
- API calls return valid responses
- Mobile menu works on small screens
- No console errors in browser