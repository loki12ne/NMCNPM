import React from 'react';
import { Link } from 'react-router-dom';
import QuestionForm from '../components/questions/QuestionForm';
import { ArrowLeft } from 'lucide-react';

const AskQuestionPage: React.FC = () => {
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
          <h2 className="text-xl font-bold text-gray-900">Ask a Question</h2>
          <p className="mt-1 text-sm text-gray-600">
            Provide as much detail as possible to get the best answers.
          </p>
        </div>
        
        <div className="px-6 py-5">
          <QuestionForm />
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;