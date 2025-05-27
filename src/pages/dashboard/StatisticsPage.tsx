import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import { ArrowLeft } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

const StatisticsPage: React.FC = () => {
  const { 
    systemStats,
    aiModelStats, 
    fetchSystemStats, 
    fetchAIModelStats,
    loading 
  } = useAdminStore();
  
  useEffect(() => {
    fetchSystemStats();
    fetchAIModelStats();
  }, [fetchSystemStats, fetchAIModelStats]);
  
  // Colors for charts
  const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#10B981', '#6B7280'];
  const PIE_COLORS = ['#2563EB', '#7C3AED'];
  
  const renderModelComparisonChart = () => {
    // Transform the AI model data for bar chart
    const modelData = aiModelStats.map(model => ({
      name: model.modelName,
      rating: parseFloat(model.averageRating.toFixed(1)),
      acceptance: model.acceptanceRate
    }));
    
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">AI Model Performance Comparison</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparing average ratings and acceptance rates across different AI models
          </p>
        </div>
        <div className="p-6 h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#2563EB" />
                <YAxis yAxisId="right" orientation="right" stroke="#7C3AED" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="rating" name="Average Rating (0-5)" fill="#2563EB" />
                <Bar yAxisId="right" dataKey="acceptance" name="Acceptance Rate (%)" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };
  
  const renderAIvsHumanChart = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">AI vs Human Tutors</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comparison of answers provided by AI models vs human tutors
          </p>
        </div>
        <div className="p-6 h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={systemStats.aiVsHumanAnswers}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="category"
                >
                  {systemStats.aiVsHumanAnswers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };
  
  const renderSubjectDistributionChart = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Subject Distribution</h2>
          <p className="text-sm text-gray-600 mt-1">
            Distribution of questions across different subjects
          </p>
        </div>
        <div className="p-6 h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={systemStats.subjectDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="subject" 
                  width={100} 
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Questions" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };
  
  const renderActivityOverTimeChart = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Questions Activity</h2>
          <p className="text-sm text-gray-600 mt-1">
            Number of questions asked per day
          </p>
        </div>
        <div className="p-6 h-80">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={systemStats.questionsPerDay}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Questions" 
                  stroke="#2563EB" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };
  
  const renderOverviewStats = () => {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{systemStats.totalUsers}</h3>
          <p className="text-sm text-gray-500">Total Users</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>+5% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{systemStats.totalQuestions}</h3>
          <p className="text-sm text-gray-500">Total Questions</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>+12% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{systemStats.totalAnswers}</h3>
          <p className="text-sm text-gray-500">Total Answers</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>+8% from last month</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{systemStats.totalTutors}</h3>
          <p className="text-sm text-gray-500">Total Tutors</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <span>+3% from last month</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-8">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
        <p className="mt-1 text-gray-600">
          Comprehensive analytics and insights about the platform
        </p>
      </div>
      
      {/* Overview stats */}
      {renderOverviewStats()}
      
      {/* AI Model Performance Comparison */}
      {renderModelComparisonChart()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI vs Human Answers */}
        {renderAIvsHumanChart()}
        
        {/* Subject Distribution */}
        {renderSubjectDistributionChart()}
      </div>
      
      {/* Activity Over Time */}
      {renderActivityOverTimeChart()}
      
      {/* Model Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">AI Model Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed performance metrics for each AI model
          </p>
        </div>
        <div className="px-6 py-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading model data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions Answered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acceptance Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Response Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aiModelStats.map((model) => (
                    <tr key={model.modelId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{model.modelName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{model.questionsAnswered}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">{model.averageRating.toFixed(1)}</div>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`h-4 w-4 ${i < Math.round(model.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{model.acceptanceRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{model.averageResponseTime.toFixed(1)}s</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;