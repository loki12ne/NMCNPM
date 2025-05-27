import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuestionStore, Question } from '../stores/questionStore';
import { useAuthStore } from '../stores/authStore';
import QuestionCard from '../components/questions/QuestionCard';
import Button from '../components/common/Button';
import { Search, Filter, PlusCircle, RefreshCw } from 'lucide-react';

// Subject options - same as in QuestionForm
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

const QuestionsPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { questions, fetchQuestions, loading } = useQuestionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  
  useEffect(() => {
    let filtered = [...questions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        question => 
          question.title.toLowerCase().includes(query) || 
          question.content.toLowerCase().includes(query) ||
          question.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply subject filter
    if (selectedSubject) {
      filtered = filtered.filter(
        question => question.subject === selectedSubject
      );
    }
    
    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(
        question => question.status === selectedStatus
      );
    }
    
    // Sort by most recent
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setFilteredQuestions(filtered);
  }, [questions, searchQuery, selectedSubject, selectedStatus]);
  
  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedStatus('');
  };
  
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="mt-1 text-gray-600">
            Browse and search through all questions
          </p>
        </div>
        {isAuthenticated && (
          <div className="mt-4 md:mt-0">
            <Button
              as={Link}
              to="/dashboard/ask"
              variant="primary"
              icon={<PlusCircle className="h-5 w-5" />}
            >
              Ask a Question
            </Button>
          </div>
        )}
      </div>
      
      {/* Filters section */}
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
                  placeholder="Search questions, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              <select
                id="subject"
                className="form-input"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto md:ml-2">
              <Button
                onClick={handleReset}
                variant="outline"
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Questions list */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-gray-500">Loading questions...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <>
            {filteredQuestions.map(question => (
              <QuestionCard key={question.id} question={question} preview />
            ))}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No questions found</h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <div className="mt-6">
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Reset filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;