import { create } from 'zustand';

export interface AIModelStats {
  modelId: string;
  modelName: string;
  questionsAnswered: number;
  averageRating: number;
  acceptanceRate: number; // percentage of answers that were accepted
  averageResponseTime: number; // in seconds
}

export interface SystemStats {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  totalTutors: number;
  questionsPerDay: { date: string, count: number }[];
  subjectDistribution: { subject: string, count: number }[];
  aiVsHumanAnswers: { category: string, count: number }[];
}

interface AdminState {
  aiModelStats: AIModelStats[];
  systemStats: SystemStats;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAIModelStats: () => Promise<void>;
  fetchSystemStats: () => Promise<void>;
}

// Mock data
const MOCK_AI_MODEL_STATS: AIModelStats[] = [
  {
    modelId: 'gpt4',
    modelName: 'GPT-4',
    questionsAnswered: 120,
    averageRating: 4.2,
    acceptanceRate: 85,
    averageResponseTime: 2.5
  },
  {
    modelId: 'claude',
    modelName: 'Claude',
    questionsAnswered: 95,
    averageRating: 4.5,
    acceptanceRate: 90,
    averageResponseTime: 3.2
  },
  {
    modelId: 'palm',
    modelName: 'PaLM 2',
    questionsAnswered: 80,
    averageRating: 3.9,
    acceptanceRate: 75,
    averageResponseTime: 1.8
  }
];

const MOCK_SYSTEM_STATS: SystemStats = {
  totalQuestions: 350,
  totalAnswers: 420,
  totalUsers: 180,
  totalTutors: 15,
  questionsPerDay: [
    { date: '2023-11-01', count: 12 },
    { date: '2023-11-02', count: 15 },
    { date: '2023-11-03', count: 9 },
    { date: '2023-11-04', count: 18 },
    { date: '2023-11-05', count: 22 },
    { date: '2023-11-06', count: 14 },
    { date: '2023-11-07', count: 11 }
  ],
  subjectDistribution: [
    { subject: 'Mathematics', count: 120 },
    { subject: 'Physics', count: 85 },
    { subject: 'Chemistry', count: 65 },
    { subject: 'Biology', count: 45 },
    { subject: 'Computer Science', count: 35 }
  ],
  aiVsHumanAnswers: [
    { category: 'Human Tutors', count: 280 },
    { category: 'AI Models', count: 140 }
  ]
};

export const useAdminStore = create<AdminState>((set) => ({
  aiModelStats: MOCK_AI_MODEL_STATS,
  systemStats: MOCK_SYSTEM_STATS,
  loading: false,
  error: null,
  
  fetchAIModelStats: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      set({ aiModelStats: MOCK_AI_MODEL_STATS, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch AI model statistics', 
        loading: false 
      });
    }
  },
  
  fetchSystemStats: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ systemStats: MOCK_SYSTEM_STATS, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch system statistics', 
        loading: false 
      });
    }
  }
}));