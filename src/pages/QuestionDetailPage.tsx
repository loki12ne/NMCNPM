import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuestionStore, Question, Answer } from '../stores/questionStore';
import { useAuthStore } from '../stores/authStore';
import QuestionCard from '../components/questions/QuestionCard';
import AnswerCard from '../components/questions/AnswerCard';
import AnswerForm from '../components/questions/AnswerForm';
import Button from '../components/common/Button';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { 
    fetchQuestionById, 
    fetchAnswersForQuestion,
    loading, 
    error 
  } = useQuestionStore();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      const questionData = await fetchQuestionById(id);
      if (questionData) {
        setQuestion(questionData);
        const answersData = await fetchAnswersForQuestion(id);
        setAnswers(answersData);
      }
    };
    
    loadData();
  }, [id, fetchQuestionById, fetchAnswersForQuestion]);
  
  const reloadAnswers = async () => {
    if (id) {
      const answersData = await fetchAnswersForQuestion(id);
      setAnswers(answersData);
    }
  };
  
  const isQuestionAuthor = user && question && user.id === question.userId;
  const isTutor = user && user.role === 'tutor';
  
  // Sort answers: accepted first, then by rating (if exists), then by date
  const sortedAnswers = [...answers].sort((a, b) => {
    // Accepted answers first
    if (a.status === 'accepted' && b.status !== 'accepted') return -1;
    if (a.status !== 'accepted' && b.status === 'accepted') return 1;
    
    // Then by rating (if exists)
    if (a.rating && b.rating && a.rating !== b.rating) return b.rating - a.rating;
    
    // Finally by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  if (loading && !question) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p className="mt-4 text-gray-500">Loading question...</p>
      </div>
    );
  }
  
  if (error || !question) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the question you're looking for."}
          </p>
          <Link
            to="/questions"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/questions"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Questions
        </Link>
      </div>
      
      {/* Question */}
      <QuestionCard question={question} />
      
      {/* Answers section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-primary-600" />
          Answers ({answers.length})
        </h2>
        
        {sortedAnswers.length > 0 ? (
          <div className="mt-6 space-y-6">
            {sortedAnswers.map(answer => (
              <AnswerCard 
                key={answer.id} 
                answer={answer}
                isQuestionAuthor={isQuestionAuthor}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600">No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>
      
      {/* Answer form for authenticated tutors or accepted answer message */}
      <div className="mt-8">
        {isAuthenticated ? (
          isTutor ? (
            <AnswerForm questionId={question.id} onAnswerSubmitted={reloadAnswers} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-center text-gray-600">
                Only tutors can provide answers to questions. 
                {user?.role === 'user' && (
                  <> Would you like to <Link to="/dashboard/apply-tutor\" className="text-primary-600 hover:text-primary-800">apply to become a tutor</Link>?</>
                )}
              </p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-4">
              You need to be logged in as a tutor to answer questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                as={Link}
                to="/login"
                variant="primary"
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="outline"
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;