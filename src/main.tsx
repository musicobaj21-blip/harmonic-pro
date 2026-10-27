import React from 'react';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { InstrumentProvider } from './contexts/InstrumentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GlobalMidiProvider } from './contexts/GlobalMidiContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Error caught!", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: '20px', backgroundColor: 'black', zIndex: 9999, position: 'relative'}}><h1>Something went wrong.</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <InstrumentProvider>
        <GlobalMidiProvider>
          <ErrorBoundary><App /></ErrorBoundary>
        </GlobalMidiProvider>
      </InstrumentProvider>
    </LanguageProvider>
  </StrictMode>,
);
