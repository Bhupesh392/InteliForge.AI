# 🔧 Troubleshooting Guide

## Frontend Testing Errors

### Error: Cannot find module '@testing-library/react'
```
ERROR in src/App.test.tsx:2:32
TS2307: Cannot find module '@testing-library/react' or its corresponding type declarations.
```

**Solution:**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @types/jest
```

### Error: Cannot find name 'test' or 'expect'
```
TS2582: Cannot find name 'test'. Do you need to install type definitions for a test runner?
TS2304: Cannot find name 'expect'.
```

**Solution:**
```bash
cd frontend
npm install --save-dev @types/jest
```

**Alternative:** Remove the test file if not needed:
```bash
del src\App.test.tsx
```

## Common Issues

### Port 3000 Already in Use
```
Something is already running on port 3000.
```

**Solution:**
```bash
set PORT=3001 && npm start
```

### Backend Not Responding
```
Network Error / CORS Error
```

**Solutions:**
1. Check if backend is running:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. Start backend:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload
   ```

### Node.js Not Found
```
'node' is not recognized as an internal or external command
```

**Solution:**
Install Node.js from https://nodejs.org/

### Python Not Found
```
'python' is not recognized as an internal or external command
```

**Solution:**
Install Python from https://python.org/

### Dependencies Not Installing
```
npm install fails
```

**Solutions:**
1. Clear cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules:
   ```bash
   rmdir /s /q node_modules
   npm install
   ```

3. Use different registry:
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

## Quick Fixes

### Skip Tests During Development
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "start": "SKIP_PREFLIGHT_CHECK=true react-scripts start"
  }
}
```

### Disable Test File
Rename `App.test.tsx` to `App.test.tsx.disabled`

### Use Manual Testing Only
Run `manual-test.bat` instead of automated tests

## Environment Issues

### Windows Path Issues
Use double backslashes in paths:
```
"d:\\AI Projects\\ai-code-platform"
```

### Permission Errors
Run command prompt as Administrator

### Firewall Blocking
Allow Node.js and Python through Windows Firewall

## Quick Recovery

If everything fails:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install`
4. Run `npm start`

## Contact Support

If issues persist:
1. Check console for detailed errors
2. Verify all prerequisites are installed
3. Try running `manual-test.bat` for basic functionality