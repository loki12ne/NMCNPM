import React, { useState } from 'react';
import { useQuestionStore } from '../../stores/questionStore';
import Button from '../common/Button';
import { HelpCircle, Send } from 'lucide-react';
import { processTextWithMath } from '../common/MathRenderer';

interface AnswerFormProps {
  questionId: string;
  onAnswerSubmitted?: () => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ 
  questionId, 
  onAnswerSubmitted 
}) => {
  const { createAnswer, loading, error } = useQuestionStore();
  
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!content.trim()) {
      setFormError('Please enter your answer');
      return;
    }
    
    try {
      await createAnswer({
        questionId,
        content,
        isAiGenerated: false
      });
      
      setContent('');
      setShowPreview(false);
      if (onAnswerSubmitted) {
        onAnswerSubmitted();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to post answer');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <div className="flex flex-col">
              {showPreview ? (
                <div className="border rounded-md p-4 bg-gray-50 min-h-[150px] prose prose-sm max-w-none">
                  {processTextWithMath(content)}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="form-input min-h-[150px]"
                  placeholder="Write your answer here. For math expressions, use x^2 for superscript notation or KaTeX syntax."
                  rows={6}
                />
              )}
              
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <HelpCircle className="h-3 w-3 mr-1" />
                <span>
                  Use $ symbols for inline math and $$ for display mode math (e.g., $x^2$ or $$E=mc^2$$)
                </span>
              </div>
            </div>
          </div>
          
          {(formError || error) && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {formError || error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Send className="h-4 w-4" />}
              isLoading={loading}
            >
              Post Answer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnswerForm;