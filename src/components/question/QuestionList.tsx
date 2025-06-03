import React from 'react';
import QuestionItem from './QuestionItem';
import { Question } from '../../types';

interface QuestionListProps {
  questions: Question[];
}

const QuestionList: React.FC<QuestionListProps> = ({ questions }) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No questions found.</p>
        <p className="text-gray-500 mt-2">Try a different search or ask a question!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {questions.map(question => (
        <QuestionItem key={question.id} question={question} />
      ))}
    </div>
  );
};

export default QuestionList;