import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import type { Question } from '../../stores/questionStore';
import { processTextWithMath } from '../common/MathRenderer';

interface QuestionCardProps {
  question: Question;
  preview?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, preview = false }) => {
  // Format the question content for preview
  const previewContent = preview && question.content.length > 150
    ? `${question.content.substring(0, 150)}...`
    : question.content;
  
  // Status badge styles and icons
  const statusConfig = {
    open: {
      color: 'bg-blue-100 text-blue-800',
      icon: <Clock className="h-4 w-4 mr-1" />
    },
    answered: {
      color: 'bg-green-100 text-green-800',
      icon: <MessageSquare className="h-4 w-4 mr-1" />
    },
    closed: {
      color: 'bg-gray-100 text-gray-800',
      icon: <CheckCircle className="h-4 w-4 mr-1" />
    }
  };
  
  return (
    <div className="card hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={`/questions/${question.id}`} 
              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              {question.title}
            </Link>
            <div className="flex flex-wrap items-center mt-2 space-x-2">
              <span className="badge badge-primary">{question.subject}</span>
              {question.tags.map(tag => (
                <span key={tag} className="badge badge-secondary">{tag}</span>
              ))}
              <span 
                className={`badge inline-flex items-center ${statusConfig[question.status].color}`}
              >
                {statusConfig[question.status].icon}
                {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-gray-600 text-sm">
          {preview ? (
            <div className="prose prose-sm max-w-none">
              {processTextWithMath(previewContent)}
              {question.content.length > 150 && (
                <Link 
                  to={`/questions/${question.id}`} 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Read more
                </Link>
              )}
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              {processTextWithMath(question.content)}
            </div>
          )}
          
          {/* Display file attachments if any */}
          {question.fileAttachments && question.fileAttachments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500">Attachments:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {question.fileAttachments.map(file => (
                  <a 
                    key={file.id} 
                    href={file.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <span>
                      {file.name.length > 15 
                        ? `${file.name.substring(0, 12)}...` 
                        : file.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {question.userAvatar ? (
                <img
                  className="h-6 w-6 rounded-full"
                  src={question.userAvatar}
                  alt={question.userName}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-800 font-medium text-xs">
                    {question.userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-2 flex items-center">
              <span>{question.userName}</span>
            </div>
          </div>
          <span>
            Posted {format(new Date(question.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;