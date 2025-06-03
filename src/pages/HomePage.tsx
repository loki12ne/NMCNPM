import React from 'react';
import QuestionList from '../components/question/QuestionList';
import { useQuestions } from '../contexts/QuestionsContext';

interface HomePageProps {
  searchQuery: string;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const { questions } = useQuestions();
  
  // Filter questions based on search query
  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      <QuestionList questions={filteredQuestions} />
    </div>
  );
};

export default HomePage;