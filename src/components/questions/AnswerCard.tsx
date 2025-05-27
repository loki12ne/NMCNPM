import React, { useState } from 'react';
import { format } from 'date-fns';
import { Star, ThumbsUp, ThumbsDown, Award, Bot } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuestionStore, Answer } from '../../stores/questionStore';
import Button from '../common/Button';
import { processTextWithMath } from '../common/MathRenderer';

interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  isQuestionAuthor 
}) => {
  const { user } = useAuthStore();
  const { rateAnswer } = useQuestionStore();
  
  const [rating, setRating] = useState<number>(answer.rating || 0);
  const [feedback, setFeedback] = useState<string>(answer.feedback || '');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  
  const handleRating = async () => {
    setIsSubmittingRating(true);
    try {
      await rateAnswer(answer.id, rating, feedback);
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  return (
    <div className={`card ${
      answer.status === 'accepted' ? 'border-green-200 bg-green-50' : ''
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {answer.userAvatar ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={answer.userAvatar}
                  alt={answer.userName}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-800 font-medium">
                    {answer.userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {answer.userName}
                {answer.userRole === 'tutor' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    Tutor
                  </span>
                )}
                {answer.isAiGenerated && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Bot className="mr-1 h-3 w-3" />
                    AI ({answer.aiModel})
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(answer.createdAt), 'MMM d, yyyy, h:mm a')}
              </p>
            </div>
          </div>
          
          {answer.status === 'accepted' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Award className="mr-1 h-3 w-3" />
              Best Answer
            </span>
          )}
        </div>
        
        <div className="mt-4 text-gray-700">
          <div className="prose prose-sm max-w-none">
            {processTextWithMath(answer.content)}
          </div>
        </div>
        
        {answer.rating && (
          <div className="mt-4 bg-gray-50 p-3 rounded-md">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`h-4 w-4 ${i < answer.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {answer.rating} out of 5
              </span>
            </div>
            {answer.feedback && (
              <p className="mt-1 text-sm text-gray-600">
                "{answer.feedback}"
              </p>
            )}
          </div>
        )}
        
        {isQuestionAuthor && answer.status === 'pending' && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700">Rate this answer:</h4>
            <div className="mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 focus:outline-none ${
                      star <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <Star className={star <= rating ? 'fill-yellow-400 h-5 w-5' : 'h-5 w-5'} />
                  </button>
                ))}
              </div>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Leave feedback for this answer (optional)"
                className="mt-2 form-input text-sm"
                rows={2}
              />
              
              <div className="mt-2 flex space-x-3">
                <Button 
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingRating}
                  onClick={handleRating}
                >
                  Submit Rating
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;