import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTutorStore } from '../../stores/tutorStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../../components/common/Button';
import FileUpload from '../../components/common/FileUpload';
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

// Subject options - same as in other components
const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Geography',
  'Literature',
  'Languages',
  'Economics',
  'Business',
  'Psychology',
  'Philosophy',
  'Art',
  'Music',
  'Other'
];

interface FileWithPreview {
  id: string;
  name: string;
  type: string;
  url?: string;
}

const TutorApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { applications, submitApplication, fetchApplications, loading, error } = useTutorStore();
  
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [userApplication, setUserApplication] = useState<any | null>(null);
  
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);
  
  useEffect(() => {
    if (user && applications.length > 0) {
      const existing = applications.find(app => app.userId === user.id);
      if (existing) {
        setUserApplication(existing);
      }
    }
  }, [user, applications]);
  
  const handleFileUpload = (uploadedFiles: File[]) => {
    // Only accept one resume file
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      setFiles([{
        id: '1',
        name: file.name,
        type: file.type,
        // In a real app, we'd upload to a server and get a URL back
        url: URL.createObjectURL(file)
      }]);
    }
  };
  
  const handleFileRemove = () => {
    setFiles([]);
  };
  
  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Simple validation
    if (!qualifications.trim()) {
      setFormError('Please enter your qualifications');
      return;
    }
    if (!experience.trim()) {
      setFormError('Please enter your experience');
      return;
    }
    if (selectedSubjects.length === 0) {
      setFormError('Please select at least one subject');
      return;
    }
    
    try {
      await submitApplication({
        qualifications,
        experience,
        subjects: selectedSubjects,
        resume: files.length > 0 ? files[0].url : undefined
      });
      
      // Refresh the applications list to get the updated status
      await fetchApplications();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit application');
    }
  };
  
  // Application status components
  const renderApplicationStatus = () => {
    const statusConfig = {
      pending: {
        icon: <Clock className="h-10 w-10 text-yellow-500" />,
        title: 'Application Under Review',
        description: 'Your application is being reviewed by our team. This process typically takes 2-3 business days.'
      },
      approved: {
        icon: <CheckCircle className="h-10 w-10 text-green-500" />,
        title: 'Application Approved',
        description: 'Congratulations! Your application has been approved. You can now answer questions as a tutor.'
      },
      rejected: {
        icon: <XCircle className="h-10 w-10 text-red-500" />,
        title: 'Application Rejected',
        description: 'Unfortunately, your application was not approved at this time.'
      }
    };
    
    const status = userApplication.status as keyof typeof statusConfig;
    const config = statusConfig[status];
    
    return (
      <div className="text-center py-8">
        {config.icon}
        <h3 className="mt-4 text-xl font-semibold text-gray-900">{config.title}</h3>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">{config.description}</p>
        
        {status === 'rejected' && userApplication.adminFeedback && (
          <div className="mt-4 bg-red-50 p-4 rounded-md mx-auto max-w-md">
            <h4 className="text-sm font-medium text-red-800">Feedback from Admin:</h4>
            <p className="mt-1 text-sm text-red-700">{userApplication.adminFeedback}</p>
          </div>
        )}
        
        <div className="mt-6">
          {status === 'approved' ? (
            <Button
              as={Link}
              to="/tutor"
              variant="primary"
              icon={<CheckCircle className="h-5 w-5" />}
            >
              Go to Tutor Dashboard
            </Button>
          ) : status === 'rejected' ? (
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          ) : (
            <Button
              as={Link}
              to="/dashboard"
              variant="primary"
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-8">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Tutor Application</h2>
          <p className="mt-1 text-sm text-gray-600">
            Share your expertise and help students by becoming a tutor on our platform.
          </p>
        </div>
        
        <div className="px-6 py-5">
          {userApplication ? (
            renderApplicationStatus()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="qualifications" className="form-label">
                  Educational Qualifications
                </label>
                <textarea
                  id="qualifications"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Bachelor of Science in Physics, Master's in Mathematics"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="experience" className="form-label">
                  Teaching Experience
                </label>
                <textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="form-input"
                  placeholder="Describe your teaching or tutoring experience"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="form-label">
                  Subjects You Can Teach
                </label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {SUBJECTS.map(subject => (
                    <div key={subject} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`subject-${subject}`}
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                          checked={selectedSubjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={`subject-${subject}`} className="font-medium text-gray-700">
                          {subject}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="form-label">Resume / CV (Optional)</label>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  files={files}
                  onFileRemove={handleFileRemove}
                  acceptedFileTypes={['application/pdf', '.doc', '.docx']}
                  maxFiles={1}
                />
              </div>
              
              {(formError || error) && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {formError || error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="mr-3"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Upload className="h-4 w-4" />}
                  isLoading={loading}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorApplicationPage;