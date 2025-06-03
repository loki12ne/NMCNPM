import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question } from '../types';
import { useAuth } from './AuthContext';

interface NewQuestion {
  title: string;
  tags: string[];
}

interface QuestionsContextType {
  questions: Question[];
  addQuestion: (newQuestion: NewQuestion) => void;
  likeQuestion: (id: number) => void;
}

const QuestionsContext = createContext<QuestionsContextType>({
  questions: [],
  addQuestion: () => {},
  likeQuestion: () => {},
});

export const useQuestions = () => useContext(QuestionsContext);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([
    { 
      id: 1, 
      title: "How to get 10.0 in Math?", 
      likes: 100, 
      liked: false,
      comments: 99, 
      tags: ["Math", "English"], 
      author: "Aurora", 
      time: "1 year ago" 
    },
    { 
      id: 2, 
      title: "How to get 9.0 IELTS?", 
      likes: 100, 
      liked: false,
      comments: 99, 
      tags: ["English"], 
      author: "Aurora", 
      time: "1 year ago" 
    },
    { 
      id: 3, 
      title: "How to improve problem-solving skills?", 
      likes: 100, 
      liked: false,
      comments: 99, 
      tags: ["General", "Education"], 
      author: "Aurora", 
      time: "1 year ago" 
    },
  ]);
  
  // Load questions from localStorage on init
  useEffect(() => {
    const storedQuestions = localStorage.getItem('qa_questions');
    if (storedQuestions) {
      try {
        setQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error('Failed to parse stored questions');
      }
    }
  }, []);
  
  // Save questions to localStorage when they change
  useEffect(() => {
    localStorage.setItem('qa_questions', JSON.stringify(questions));
  }, [questions]);
  
  const addQuestion = (newQuestion: NewQuestion) => {
    const question: Question = {
      id: Date.now(),
      title: newQuestion.title,
      likes: 0,
      liked: false,
      comments: 0,
      tags: newQuestion.tags,
      author: user?.name || 'Anonymous',
      time: 'Just now',
    };
    
    setQuestions([question, ...questions]);
  };
  
  const likeQuestion = (id: number) => {
    setQuestions(questions.map(question => {
      if (question.id === id) {
        const isLiked = !question.liked;
        return {
          ...question,
          liked: isLiked,
          likes: isLiked ? question.likes + 1 : question.likes - 1,
        };
      }
      return question;
    }));
  };
  
  return (
    <QuestionsContext.Provider value={{ questions, addQuestion, likeQuestion }}>
      {children}
    </QuestionsContext.Provider>
  );
};