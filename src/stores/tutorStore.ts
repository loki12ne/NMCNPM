import { create } from 'zustand';
import { User, UserRole, useAuthStore } from './authStore';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface TutorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  qualifications: string;
  experience: string;
  subjects: string[];
  resume?: string;
  status: ApplicationStatus;
  adminFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorStats {
  tutorId: string;
  tutorName: string;
  answersCount: number;
  acceptedAnswersCount: number;
  rejectedAnswersCount: number;
  averageRating: number;
  subjects: string[];
  responseTimeAvg: number; // in minutes
}

interface TutorState {
  applications: TutorApplication[];
  tutorStats: TutorStats[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: () => Promise<void>;
  submitApplication: (application: Omit<TutorApplication, 'id' | 'userId' | 'userName' | 'userEmail' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  reviewApplication: (applicationId: string, status: ApplicationStatus, feedback?: string) => Promise<void>;
  fetchTutorStats: () => Promise<void>;
  fetchTutorStatsById: (tutorId: string) => Promise<TutorStats | undefined>;
}

// Mock data
const MOCK_APPLICATIONS: TutorApplication[] = [
  {
    id: '1',
    userId: '3',
    userName: 'Regular User',
    userEmail: 'user@example.com',
    qualifications: 'Bachelor of Science in Mathematics',
    experience: '3 years teaching at high school level',
    subjects: ['Mathematics', 'Physics'],
    resume: 'https://example.com/resume.pdf',
    status: 'pending',
    createdAt: '2023-10-15T10:30:00Z',
    updatedAt: '2023-10-15T10:30:00Z'
  }
];

const MOCK_TUTOR_STATS: TutorStats[] = [
  {
    tutorId: '2',
    tutorName: 'Tutor User',
    answersCount: 45,
    acceptedAnswersCount: 40,
    rejectedAnswersCount: 5,
    averageRating: 4.8,
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    responseTimeAvg: 45 // 45 minutes average response time
  }
];

export const useTutorStore = create<TutorState>((set, get) => ({
  applications: MOCK_APPLICATIONS,
  tutorStats: MOCK_TUTOR_STATS,
  loading: false,
  error: null,
  
  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // In a real app, this would be an API call
      set({ applications: MOCK_APPLICATIONS, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch applications', 
        loading: false 
      });
    }
  },
  
  submitApplication: async (application) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const now = new Date().toISOString();
      const newApplication: TutorApplication = {
        ...application,
        id: String(Math.floor(Math.random() * 10000)),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      // Update the store (in a real app, this would be handled by the backend)
      const updatedApplications = [...get().applications, newApplication];
      set({ applications: updatedApplications, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit application', 
        loading: false 
      });
      throw error;
    }
  },
  
  reviewApplication: async (applicationId, status, feedback) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Update application status
      const applications = get().applications;
      const updatedApplications = applications.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            status,
            adminFeedback: feedback || app.adminFeedback,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      });
      
      // If approved, update user role in a real app
      if (status === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          // This is just for the mock data
          // In a real app, this would be handled by the backend
          const user = localStorage.getItem('user');
          if (user && JSON.parse(user).id === application.userId) {
            const updatedUser = { ...JSON.parse(user), role: 'tutor' as UserRole };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            useAuthStore.getState().checkAuth();
          }
        }
      }
      
      set({ applications: updatedApplications, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to review application', 
        loading: false 
      });
    }
  },
  
  fetchTutorStats: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ tutorStats: MOCK_TUTOR_STATS, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tutor statistics', 
        loading: false 
      });
    }
  },
  
  fetchTutorStatsById: async (tutorId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stats = MOCK_TUTOR_STATS.find(stat => stat.tutorId === tutorId);
      set({ loading: false });
      return stats;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tutor statistics', 
        loading: false 
      });
    }
  }
}));