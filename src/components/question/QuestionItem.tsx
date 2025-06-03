import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuestions } from '../../contexts/QuestionsContext';
import { Question } from '../../types';

interface QuestionItemProps {
  question: Question;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question }) => {
  const { isLoggedIn } = useAuth();
  const { likeQuestion } = useQuestions();
  
  const handleLike = () => {
    if (isLoggedIn) {
      likeQuestion(question.id);
    }
  };
  
  return (
    <div className="border-b border-gray-200 pb-6 group">
      <div className="flex items-center space-x-2">
        <button 
          onClick={handleLike}
          className="text-pink-500 hover:scale-110 transition-transform duration-200"
          disabled={!isLoggedIn}
        >
          <Heart 
            size={20} 
            fill={question.liked ? "#ec4899" : "none"} 
            className={`${!isLoggedIn && 'opacity-50'}`}
          />
        </button>
        <span className="text-gray-700">{question.likes} likes</span>
        <span className="text-gray-400">•</span>
        <span className="font-medium text-gray-800 group-hover:text-blue-500 transition-colors duration-200">
          {question.title}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {question.tags.map((tag, index) => (
          <span 
            key={index} 
            className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <MessageSquare size={16} />
          <span>{question.comments} comments</span>
        </div>
        <span>Asked {question.time}</span>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-pink-500 rounded-full mr-1"></span>
          <span>{question.author}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;