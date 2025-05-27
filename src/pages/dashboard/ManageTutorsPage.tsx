import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTutorStore, TutorApplication, ApplicationStatus } from '../../stores/tutorStore';
import Button from '../../components/common/Button';
import { ArrowLeft, Search, Check, X, FileText } from 'lucide-react';

const ManageTutorsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applications, fetchApplications, reviewApplication, loading } = useTutorStore();
  
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for application id in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const applicationId = searchParams.get('id');
    
    if (applicationId) {
      fetchApplications().then(() => {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          setSelectedApplication(application);
        }
      });
    } else {
      fetchApplications();
    }
  }, [location, fetchApplications, applications]);
  
  // Filter applications based on selected filter and search query
  const filteredApplications = applications.filter(app => {
    // Filter by status
    if (filter !== 'all' && app.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.userName.toLowerCase().includes(query) ||
        app.subjects.some(subject => subject.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    setIsSubmitting(true);
    try {
      await reviewApplication(selectedApplication.id, 'approved', feedback);
      setSelectedApplication(null);
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedApplication) return;
    
    setIsSubmitting(true);
    try {
      await reviewApplication(selectedApplication.id, 'rejected', feedback);
      setSelectedApplication(null);
      setFeedback('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Status badge component
  const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Pending'
      },
      approved: {
        color: 'bg-green-100 text-green-800',
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800',
        label: 'Rejected'
      }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
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
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tutors</h1>
          <p className="mt-1 text-gray-600">
            Review and manage tutor applications
          </p>
        </div>
      </div>
      
      {/* Application details modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Application Details
              </h2>
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setFeedback('');
                  
                  // Clear the URL parameter
                  const searchParams = new URLSearchParams(location.search);
                  searchParams.delete('id');
                  navigate({ search: searchParams.toString() });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-5 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Applicant</h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {selectedApplication.userName}
                </p>
                <p className="text-sm text-gray-500">{selectedApplication.userEmail}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1">
                  <StatusBadge status={selectedApplication.status} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Qualifications</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {selectedApplication.qualifications}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {selectedApplication.experience}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedApplication.subjects.map(subject => (
                    <span 
                      key={subject}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedApplication.resume && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                  <div className="mt-1">
                    <a
                      href={selectedApplication.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FileText className="mr-1.5 h-4 w-4" />
                      View Resume
                    </a>
                  </div>
                </div>
              )}
              
              {selectedApplication.status === 'pending' && (
                <>
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                      Feedback (optional)
                    </label>
                    <textarea
                      id="feedback"
                      rows={3}
                      className="form-input mt-1"
                      placeholder="Provide feedback to the applicant"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReject}
                      isLoading={isSubmitting}
                      icon={<X className="h-4 w-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleApprove}
                      isLoading={isSubmitting}
                      icon={<Check className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                  </div>
                </>
              )}
              
              {selectedApplication.adminFeedback && selectedApplication.status !== 'pending' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Admin Feedback</h3>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {selectedApplication.adminFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="form-label">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="form-input pl-10"
                  placeholder="Search by name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="filter" className="form-label">
                Status
              </label>
              <select
                id="filter"
                className="form-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Applications table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
        </div>
        
        <div className="px-6 py-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
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
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {application.userName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {application.subjects.slice(0, 2).join(', ')}
                          {application.subjects.length > 2 && ' +' + (application.subjects.length - 2) + ' more'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {application.status === 'pending' ? 'Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No applications found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTutorsPage;