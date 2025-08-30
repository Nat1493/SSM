// ==============================================
// src/index.js - React Application Entry Point
// ==============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Create root element and render the app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Error boundary component for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state to show error UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-red-500 text-2xl mr-3">⚠️</div>
              <h1 className="text-xl font-semibold text-gray-900">
                Application Error
              </h1>
            </div>
            <p className="text-gray-600 mb-4">
              Something went wrong while loading the SS Mudyf Order Tracker.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
                Show technical details
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                SS Mudyf Order Tracking System v1.0
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the application with error boundary and strict mode
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Handle online/offline status for better UX
window.addEventListener('online', () => {
  console.log('✅ Application is online');
});

window.addEventListener('offline', () => {
  console.log('⚠️ Application is offline');
});

// Global error handler for uncaught promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Log application startup
console.log(`
🏭 SS Mudyf Order Tracking System
📍 Textile CMT Factory - Eswatini
🚀 Application starting...
`);

// Development helper
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode active');
}