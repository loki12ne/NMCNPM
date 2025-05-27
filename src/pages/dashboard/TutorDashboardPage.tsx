import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useQuestionStore, Question } from '../../stores/questionStore';
import { useTutorStore } from '../../stores/tutorStore';
import QuestionCard from '../../components/questions/QuestionCard';
import Button from '../../components/common/Button';
import { 
  Award, 
  Star, 
  Clock, 
  BarChart, 
  MessageSquare, 
  Users 
} from 'lucide-react';

const TutorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { questions, fetchQuestions, loading: questionsLoading } = useQuestionStore();
  const { fetchTutorStatsById, loading: statsLoading } = useTutorStore();
  
  const [openQuestions, setOpenQuestions] = useState<Question[]>([]);
  const [tutorStats, setTutorStats] = useState({
    answersCount: 0,
    acceptedAnswersCount: 0,
    rejectedAnswersCount: 0,
    averageRating: 0,
    responseTimeAvg: 0
  });
  
  useEffect(() => {
    fetchQuestions();
    if (user) {
      fetchTutorStatsById(user.id).then(stats => {
        if (stats) {
          setTutorStats(stats);
        }
      });
    }
  }, [fetchQuestions, fetchTutorStatsById, user]);
  
  useEffect(() => {
    const filtered = questions.filter(q => q.status === 'open');
    // Sort by most recent first
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOpenQuestions(filtered.slice(0, 5)); // Get the 5 most recent
  }, [questions]);
  
  // Format response time in minutes to a readable format
  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };
  
  const renderStats = () => {
    const stats = [
      { name: 'Total Answers', value: tutorStats.answersCount, icon: <MessageSquare className="h-6 w-6 text-primary-600" /> },
      { name: 'Accepted Answers', value: tutorStats.acceptedAnswersCount, icon: <Award className="h-6 w-6 text-green-600" /> },
      { name: 'Avg. Rating', value: tutorStats.averageRating.toFixed(1), icon: <Star className="h-6 w-6 text-yellow-500" /> },
      { name: 'Avg. Response Time', value: formatResponseTime(tutorStats.responseTimeAvg), icon: <Clock className="h-6 w-6 text-blue-600" /> },
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
          <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button
            as={Link}
            to="/questions"
            variant="primary"
            icon={<MessageSquare className="h-5 w-5" />}
          >
            Answer Questions
          </Button>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="mb-8">
        {statsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : (
          renderStats()
        )}
      </div>
      
      {/* Open questions section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Recent Open Questions
            </h2>
            <Link
              to="/questions?status=open"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          
          <div className="px-6 py-5">
            {questionsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              </div>
            ) : openQuestions.length > 0 ? (
              <div className="space-y-6">
                {openQuestions.map(question => (
                  <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <Link 
                      to={`/questions/${question.id}`}
                      className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                    >
                      {question.title}
                    </Link>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="badge badge-primary">{question.subject}</span>
                      <span className="text-xs text-gray-500">
                        Posted {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No open questions at the moment.
              </div>
            )}
          </div>
        </div>
        
        {/* Performance metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-accent-600" />
              Your Performance
            </h2>
          </div>
          
          <div className="px-6 py-5">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Answer Acceptance Rate</h3>
                <div className="mt-2 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        width: `${tutorStats.answersCount > 0 
                          ? (tutorStats.acceptedAnswersCount / tutorStats.answersCount) * 100 
                          : 0}%`
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                  <div className="mt-1 text-right text-xs text-gray-600">
                    {tutorStats.answersCount > 0 
                      ? `${((tutorStats.acceptedAnswersCount / tutorStats.answersCount) * 100).toFixed(1)}%` 
                      : '0%'}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(tutorStats.averageRating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    {tutorStats.averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Activity Level</h3>
                <div className="mt-2 relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{
                        // This is arbitrary for demo purposes
                        width: `${Math.min(tutorStats.answersCount / 2, 100)}%`
                      }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-600">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button
                as={Link}
                to="/tutor/statistics"
                variant="outline"
                size="sm"
              >
                View Detailed Statistics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboardPage;