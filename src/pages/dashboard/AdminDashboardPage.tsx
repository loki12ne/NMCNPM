import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { useTutorStore, ApplicationStatus } from '../../stores/tutorStore';
import Button from '../../components/common/Button';
import { 
  Users, 
  BookOpen, 
  BarChart2, 
  MessageSquare, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
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
  Cell 
} from 'recharts';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { systemStats, fetchSystemStats, loading: statsLoading } = useAdminStore();
  const { applications, fetchApplications, loading: applicationsLoading } = useTutorStore();
  
  useEffect(() => {
    fetchSystemStats();
    fetchApplications();
  }, [fetchSystemStats, fetchApplications]);
  
  const pendingApplications = applications.filter(app => app.status === 'pending');
  
  // Colors for pie chart
  const COLORS = ['#2563EB', '#7C3AED', '#F59E0B', '#10B981', '#6B7280'];
  
  const renderSummaryStats = () => {
    const stats = [
      { name: 'Total Users', value: systemStats.totalUsers, icon: <User className="h-6 w-6 text-primary-600" />, link: '/admin/users' },
      { name: 'Total Questions', value: systemStats.totalQuestions, icon: <MessageSquare className="h-6 w-6 text-secondary-600" />, link: '/questions' },
      { name: 'Total Tutors', value: systemStats.totalTutors, icon: <BookOpen className="h-6 w-6 text-accent-600" />, link: '/admin/tutors' },
      { name: 'Pending Applications', value: pendingApplications.length, icon: <AlertCircle className="h-6 w-6 text-warning-500" />, link: '/admin/tutors' },
    ];
    
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-full bg-gray-50">{stat.icon}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to={stat.link}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  View details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Button
            as={Link}
            to="/admin/tutors"
            variant="outline"
            icon={<Users className="h-5 w-5" />}
          >
            Manage Tutors
          </Button>
          <Button
            as={Link}
            to="/admin/statistics"
            variant="primary"
            icon={<BarChart2 className="h-5 w-5" />}
          >
            View Statistics
          </Button>
        </div>
      </div>
      
      {/* Stats summary section */}
      <div className="mb-8">
        {statsLoading || applicationsLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : (
          renderSummaryStats()
        )}
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Questions per day chart */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Questions per Day</h2>
          </div>
          <div className="p-6 h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                  <Bar dataKey="count" name="Questions" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Subject distribution chart */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Subject Distribution</h2>
          </div>
          <div className="p-6 h-80">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={systemStats.subjectDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ subject, percent }) => `${subject}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="subject"
                  >
                    {systemStats.subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.subject]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Pending applications */}
      <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Pending Tutor Applications</h2>
          <Link
            to="/admin/tutors"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
        
        <div className="px-6 py-5">
          {applicationsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
            </div>
          ) : pendingApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {application.userName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.subjects.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/tutors?id=${application.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending applications at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;