# 🚀 Frontend Setup Guide

## Quick Start (Windows)

1. **Double-click `frontend/start.bat`** - This will automatically:
   - Check Node.js installation
   - Install dependencies if needed
   - Start the development server

2. **Manual Setup:**
   ```cmd
   cd frontend
   npm install
   npm start
   ```

## Quick Start (Mac/Linux)

1. **Run the startup script:**
   ```bash
   cd frontend
   ./start.sh
   ```

2. **Manual Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📋 Requirements

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## 🌐 Access Points

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:8000 (must be running)

## 🔧 Troubleshooting

### Port 3000 in use?
```bash
set PORT=3001 && npm start
```

### Dependencies issues?
```bash
rmdir /s /q node_modules
npm install
```

### Backend not connecting?
- Ensure backend is running on port 8000
- Check `.env` file in frontend folder

## 📱 Features

✅ Mobile responsive design  
✅ Code generation with AI  
✅ Automated test creation  
✅ Code review and analysis  
✅ Real-time syntax highlighting  
✅ Modern glass-morphism UI  

---

**Need help?** Check `frontend/README.md` for detailed documentation.