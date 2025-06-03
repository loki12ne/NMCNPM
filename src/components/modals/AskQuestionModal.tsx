//Cửa sổ pop up đặt câu hỏi
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useQuestions } from '../../contexts/QuestionsContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from './Modal';

interface AskQuestionModalProps {
  onClose: () => void;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({ onClose }) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['General']);
  const { addQuestion } = useQuestions();
  const { user } = useAuth();
  
  const availableTags = ['General', 'Math', 'English', 'Science', 'History', 'Technology'];
  // Hàm xử lý gửi câu hỏi
  const handleSubmit = (e: React.FormEvent) => { //
    e.preventDefault();
    if (questionText.trim()) {
      addQuestion({
        title: questionText,
        tags: selectedTags,
      });
      onClose();
    }
  };
  
  const toggleTag = (tag: string) => { //bật tắt tag
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <Modal onClose={onClose}>
      <div className="p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ask a Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Your Question
              </label>
              <input
                id="question"
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="What would you like to ask?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              Post Question
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AskQuestionModal;