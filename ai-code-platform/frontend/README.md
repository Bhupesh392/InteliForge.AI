# AI Code Platform Frontend

A modern, responsive React application for AI-powered code generation, testing, and review.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - If port 3000 is busy, it will use the next available port

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm test` | Launches the test runner |
| `npm run eject` | Ejects from Create React App (⚠️ irreversible) |

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
GENERATE_SOURCEMAP=false
```

### Backend Connection
- Ensure your backend is running on `http://localhost:8000`
- The frontend will show connection status on the dashboard

## 📱 Features

### ✨ Modern UI/UX
- Responsive design for mobile, tablet, and desktop
- Glass-morphism design elements
- Smooth animations and transitions
- Dark/light theme support

### 🎯 Core Features
- **Code Generator**: Generate code from natural language descriptions
- **Test Generator**: Create comprehensive test suites automatically
- **Code Reviewer**: Get detailed code analysis and suggestions
- **Dashboard**: Monitor system health and access all features

### 📱 Mobile Responsive
- Hamburger menu for mobile navigation
- Touch-friendly interface
- Optimized layouts for all screen sizes

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port 3000 already in use
```bash
# Use a different port
set PORT=3001 && npm start
# or
PORT=3001 npm start  # On Mac/Linux
```

#### 2. Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s /q node_modules  # Windows
rm -rf node_modules       # Mac/Linux
npm install
```

#### 3. Backend connection issues
- Check if backend is running on `http://localhost:8000`
- Verify CORS settings in backend
- Check network/firewall settings

#### 4. Build errors
```bash
# Update dependencies
npm update

# Clear cache and reinstall
npm cache clean --force
npm install
```

## 🏗️ Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.tsx     # Navigation bar
│   │   └── CodeEditor.tsx # Code editor component
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── CodeGenerator.tsx
│   │   ├── TestGenerator.tsx
│   │   └── CodeReviewer.tsx
│   ├── services/          # API services
│   │   └── api.ts         # Backend API calls
│   ├── types/             # TypeScript types
│   │   └── api.ts         # API type definitions
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # App entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── .env                   # Environment variables
```

## 🎨 Customization

### Styling
- Global styles in `src/index.css`
- Component-specific styles inline
- CSS variables for theme colors
- Responsive breakpoints defined

### Adding New Features
1. Create component in `src/components/` or `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Navbar.tsx`
4. Add API calls in `src/services/api.ts`

## 🔍 Development Tips

### Hot Reload
- Changes are automatically reflected in the browser
- No need to restart the server for most changes

### Debugging
- Use browser developer tools
- React Developer Tools extension recommended
- Console logs for API responses

### Performance
- Code splitting implemented
- Lazy loading for better performance
- Optimized bundle size

## 📦 Production Build

1. **Create production build:**
   ```bash
   npm run build
   ```

2. **Serve static files:**
   ```bash
   # Using serve package
   npx serve -s build

   # Using Python
   cd build && python -m http.server 3000
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check this README for common solutions
2. Verify backend is running
3. Check browser console for errors
4. Ensure all dependencies are installed
5. Try clearing cache and reinstalling

## 🌟 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

---

**Happy Coding! 🚀**