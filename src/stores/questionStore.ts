import { create } from 'zustand';
import { format } from 'date-fns';

export type QuestionStatus = 'open' | 'answered' | 'closed';
export type AnswerStatus = 'pending' | 'accepted' | 'rejected';

export interface Question {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  tags: string[];
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  fileAttachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  rating?: number;
  feedback?: string;
  status: AnswerStatus;
  isAiGenerated: boolean;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionState {
  questions: Question[];
  answers: Answer[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchQuestions: () => Promise<void>;
  fetchQuestionById: (id: string) => Promise<Question | undefined>;
  fetchAnswersForQuestion: (questionId: string) => Promise<Answer[]>;
  createQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'status'>) => Promise<Question>;
  createAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName' | 'userRole' | 'status'>) => Promise<Answer>;
  rateAnswer: (answerId: string, rating: number, feedback?: string) => Promise<void>;
  updateQuestionStatus: (questionId: string, status: QuestionStatus) => Promise<void>;
}

// Mock data for development
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    title: 'How do I solve this quadratic equation: x^2 - 5x + 6 = 0?',
    content: 'I\'m having trouble with this quadratic equation. Can someone please show the steps to solve x^2 - 5x + 6 = 0? I\'ve tried using the formula but I\'m getting confused with the signs.',
    userId: '3',
    userName: 'Regular User',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    subject: 'Mathematics',
    tags: ['algebra', 'quadratic-equations'],
    status: 'answered',
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2023-11-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'What are the key differences between mitosis and meiosis?',
    content: 'I need to understand the fundamental differences between mitosis and meiosis for my biology exam. Can someone provide a clear comparison?',
    userId: '3',
    userName: 'Regular User',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    subject: 'Biology',
    tags: ['cell-division', 'genetics'],
    status: 'open',
    createdAt: '2023-11-16T14:20:00Z',
    updatedAt: '2023-11-16T14:20:00Z'
  },
  {
    id: '3',
    title: 'Explain Newton\'s Third Law of Motion with examples',
    content: 'I need help understanding Newton\'s Third Law - "For every action, there is an equal and opposite reaction." Can someone explain this with practical examples?',
    userId: '3',
    userName: 'Regular User',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    subject: 'Physics',
    tags: ['newton-laws', 'mechanics'],
    status: 'open',
    createdAt: '2023-11-17T09:45:00Z',
    updatedAt: '2023-11-17T09:45:00Z'
  }
];

const MOCK_ANSWERS: Answer[] = [
  {
    id: '1',
    questionId: '1',
    content: 'To solve x^2 - 5x + 6 = 0, we can use factoring. \n\nStep 1: Find two numbers that multiply to give 6 and add to give -5.\nThese numbers are -2 and -3 (since -2 × -3 = 6 and -2 + -3 = -5).\n\nStep 2: Rewrite the equation using these factors.\nx^2 - 5x + 6 = 0\n(x - 2)(x - 3) = 0\n\nStep 3: Set each factor equal to zero and solve.\nx - 2 = 0, therefore x = 2\nx - 3 = 0, therefore x = 3\n\nThe solutions are x = 2 and x = 3.',
    userId: '2',
    userName: 'Tutor User',
    userRole: 'tutor',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    feedback: 'Excellent explanation! Very clear and easy to follow.',
    status: 'accepted',
    isAiGenerated: false,
    createdAt: '2023-11-15T11:20:00Z',
    updatedAt: '2023-11-15T11:20:00Z'
  },
  {
    id: '2',
    questionId: '1',
    content: 'The quadratic equation x^2 - 5x + 6 = 0 can be solved using the quadratic formula: x = (-b ± √(b^2 - 4ac)) / 2a, where a=1, b=-5, and c=6.\n\nx = (5 ± √(25 - 24)) / 2\nx = (5 ± √1) / 2\nx = (5 ± 1) / 2\n\nSo, x = 3 or x = 2',
    userId: '4',
    userName: 'AI Assistant',
    userRole: 'system',
    status: 'pending',
    isAiGenerated: true,
    aiModel: 'GPT-4',
    createdAt: '2023-11-15T11:15:00Z',
    updatedAt: '2023-11-15T11:15:00Z'
  }
];

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: MOCK_QUESTIONS,
  answers: MOCK_ANSWERS,
  loading: false,
  error: null,
  
  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, this would be an API call
      set({ questions: MOCK_QUESTIONS, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch questions', 
        loading: false 
      });
    }
  },
  
  fetchQuestionById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const question = MOCK_QUESTIONS.find(q => q.id === id);
      set({ loading: false });
      return question;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch question', 
        loading: false 
      });
    }
  },
  
  fetchAnswersForQuestion: async (questionId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const answers = MOCK_ANSWERS.filter(a => a.questionId === questionId);
      set({ loading: false });
      return answers;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch answers', 
        loading: false 
      });
      return [];
    }
  },
  
  createQuestion: async (question) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const now = new Date().toISOString();
      const newQuestion: Question = {
        ...question,
        id: String(Math.floor(Math.random() * 10000)),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        status: 'open',
        createdAt: now,
        updatedAt: now
      };
      
      // Update the store (in a real app, this would be handled by the backend)
      const updatedQuestions = [...get().questions, newQuestion];
      set({ questions: updatedQuestions, loading: false });
      
      return newQuestion;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create question', 
        loading: false 
      });
      throw error;
    }
  },
  
  createAnswer: async (answer) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const now = new Date().toISOString();
      const newAnswer: Answer = {
        ...answer,
        id: String(Math.floor(Math.random() * 10000)),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        userAvatar: user.avatar,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      // Update the store
      const updatedAnswers = [...get().answers, newAnswer];
      set({ answers: updatedAnswers, loading: false });
      
      return newAnswer;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create answer', 
        loading: false 
      });
      throw error;
    }
  },
  
  rateAnswer: async (answerId, rating, feedback) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const answers = get().answers;
      const updatedAnswers = answers.map(answer => {
        if (answer.id === answerId) {
          return {
            ...answer,
            rating,
            feedback: feedback || answer.feedback,
            status: 'accepted' as AnswerStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return answer;
      });
      
      set({ answers: updatedAnswers, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to rate answer', 
        loading: false 
      });
    }
  },
  
  updateQuestionStatus: async (questionId, status) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const questions = get().questions;
      const updatedQuestions = questions.map(question => {
        if (question.id === questionId) {
          return {
            ...question,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return question;
      });
      
      set({ questions: updatedQuestions, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update question status', 
        loading: false 
      });
    }
  }
}));