import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layout components
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskQuestionPage from './pages/AskQuestionPage';

// Dashboard pages
import UserDashboardPage from './pages/dashboard/UserDashboardPage';
import TutorDashboardPage from './pages/dashboard/TutorDashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import TutorApplicationPage from './pages/dashboard/TutorApplicationPage';
import ManageTutorsPage from './pages/dashboard/ManageTutorsPage';
import StatisticsPage from './pages/dashboard/StatisticsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Protected route component
const ProtectedRoute = ({ 
  element, 
  allowedRoles,
}: { 
  element: React.ReactNode, 
  allowedRoles: string[] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{element}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questions/:id" element={<QuestionDetailPage />} />
        </Route>
        
        {/* Protected routes - User */}
        <Route path="/dashboard" element={
          <ProtectedRoute 
            element={<DashboardLayout />} 
            allowedRoles={['user', 'tutor', 'admin']} 
          />
        }>
          <Route index element={<UserDashboardPage />} />
          <Route path="ask" element={<AskQuestionPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="apply-tutor" element={<TutorApplicationPage />} />
        </Route>
        
        {/* Protected routes - Tutor */}
        <Route path="/tutor" element={
          <ProtectedRoute 
            element={<DashboardLayout />} 
            allowedRoles={['tutor', 'admin']} 
          />
        }>
          <Route index element={<TutorDashboardPage />} />
        </Route>
        
        {/* Protected routes - Admin */}
        <Route path="/admin" element={
          <ProtectedRoute 
            element={<DashboardLayout />} 
            allowedRoles={['admin']} 
          />
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="tutors" element={<ManageTutorsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;