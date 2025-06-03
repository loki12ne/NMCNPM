import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuestionsProvider } from './contexts/QuestionsContext';
import AppLayout from './components/layout/AppLayout';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <QuestionsProvider>
          <AppLayout />
        </QuestionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;