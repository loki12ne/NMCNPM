import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useQuestionStore, Question } from '../../stores/questionStore';
import QuestionCard from '../../components/questions/QuestionCard';
import Button from '../../components/common/Button';
import { 
  PlusCircle, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  BookOpen,
  HelpCircle
} from 'lucide-react';

const UserDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { questions, fetchQuestions, loading } = useQuestionStore();
  
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  
  useEffect(() => {
    if (user) {
      const filtered = questions.filter(q => q.userId === user.id);
      // Sort by most recent first
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setUserQuestions(filtered);
    }
  }, [questions, user]);
  
  // Count questions by status
  const questionsStats = {
    total: userQuestions.length,
    open: userQuestions.filter(q => q.status === 'open').length,
    answered: userQuestions.filter(q => q.status === 'answered').length,
    closed: userQuestions.filter(q => q.status === 'closed').length,
  };
  
  const renderStats = () => {
    const stats = [
      { name: 'Total Questions', value: questionsStats.total, icon: <MessageSquare className="h-6 w-6 text-primary-600" /> },
      { name: 'Open', value: questionsStats.open, icon: <Clock className="h-6 w-6 text-blue-600" /> },
      { name: 'Answered', value: questionsStats.answered, icon: <MessageSquare className="h-6 w-6 text-green-600" /> },
      { name: 'Closed', value: questionsStats.closed, icon: <CheckCircle className="h-6 w-6 text-gray-600" /> },
    ];
    
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center"
          >
            <div className="p-2 rounded-full bg-gray-50">
              {stat.icon}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">{stat.value}</h3>
            <p className="text-xs text-gray-500">{stat.name}</p>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button
            as={Link}
            to="/dashboard/apply-tutor"
            variant="outline"
            icon={<BookOpen className="h-5 w-5" />}
          >
            Apply as Tutor
          </Button>
          <Button
            as={Link}
            to="/dashboard/ask"
            variant="primary"
            icon={<PlusCircle className="h-5 w-5" />}
          >
            Ask a Question
          </Button>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="mb-8">
        {renderStats()}
      </div>
      
      {/* Questions section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Your Questions</h2>
          <Link
            to="/dashboard/ask"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Ask new question
          </Link>
        </div>
        
        <div className="px-6 py-5">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-4 text-gray-500">Loading your questions...</p>
            </div>
          ) : userQuestions.length > 0 ? (
            <div className="space-y-6">
              {userQuestions.map(question => (
                <QuestionCard key={question.id} question={question} preview />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No questions yet</h3>
              <p className="mt-1 text-gray-500">
                Get started by asking your first question.
              </p>
              <div className="mt-6">
                <Button
                  as={Link}
                  to="/dashboard/ask"
                  variant="primary"
                >
                  Ask a Question
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;