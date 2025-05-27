import React from 'react';
import { Link } from 'react-router-dom';
import { useQuestionStore } from '../stores/questionStore';
import QuestionCard from '../components/questions/QuestionCard';
import Button from '../components/common/Button';
import { HelpCircle, BookOpen, Users, Search, Award, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const { questions, fetchQuestions } = useQuestionStore();
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        await fetchQuestions();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestions();
  }, [fetchQuestions]);
  
  const recentQuestions = questions.slice(0, 3);
  
  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl">
                <span className="block">Learn Better with</span>
                <span className="block text-secondary-400">EduQ&A Platform</span>
              </h1>
              <p className="mt-3 text-lg sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Get help with your homework, assignments, and academic questions from qualified tutors.
                Join our community of students and educators.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="grid gap-3 sm:grid-flow-col sm:grid-cols-2">
                  <Button 
                    as={Link} 
                    to="/questions"
                    fullWidth
                    className="bg-white text-primary-700 hover:bg-gray-100"
                    icon={<Search className="h-5 w-5" />}
                  >
                    Browse Questions
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register"
                    fullWidth
                    variant="secondary"
                    icon={<HelpCircle className="h-5 w-5" />}
                  >
                    Ask a Question
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <img
                  className="w-full rounded-lg"
                  src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Students collaborating"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How it works section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How EduQ&A Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Get answers to your academic questions in three simple steps.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 mb-4">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Ask a Question</h3>
              <p className="mt-2 text-base text-gray-500">
                Post your question with all the details. Add files or images to provide more context.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary-100 text-secondary-700 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Get Expert Answers</h3>
              <p className="mt-2 text-base text-gray-500">
                Qualified tutors and AI assistants will provide detailed answers to your questions.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent-100 text-accent-700 mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Rate & Learn</h3>
              <p className="mt-2 text-base text-gray-500">
                Rate the answers, provide feedback, and select the best answer to help others learn.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent questions section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Recent Questions
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Explore the latest questions from our community.
            </p>
          </div>
          
          <div className="mt-12 space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="mt-4 text-gray-500">Loading questions...</p>
              </div>
            ) : recentQuestions.length > 0 ? (
              recentQuestions.map(question => (
                <QuestionCard key={question.id} question={question} preview />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No questions available at the moment.</p>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Link
                to="/questions"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                View all questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Become a tutor section */}
      <div className="py-16 bg-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Share Your Knowledge
              </h2>
              <p className="mt-4 text-lg text-accent-200">
                Are you an expert in your field? Join our platform as a tutor and help students
                with their academic questions. Set your own schedule and share your expertise.
              </p>
              <div className="mt-8">
                <Link
                  to="/dashboard/apply-tutor"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-accent-600 bg-white hover:bg-accent-50"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Apply to Become a Tutor
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                <img
                  className="w-full"
                  src="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Teacher helping students"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;