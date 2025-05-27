import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Generate navigation items based on user role
  const getNavigationItems = () => {
    const items = [];
    
    // Items for all authenticated users
    items.push(
      {
        name: 'Dashboard',
        href: user?.role === 'admin' ? '/admin' : user?.role === 'tutor' ? '/tutor' : '/dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
      }
    );
    
    // Items for regular users
    if (user?.role === 'user') {
      items.push(
        {
          name: 'Ask a Question',
          href: '/dashboard/ask',
          icon: <PlusCircle className="h-5 w-5" />,
        },
        {
          name: 'Apply as Tutor',
          href: '/dashboard/apply-tutor',
          icon: <BookOpen className="h-5 w-5" />,
        }
      );
    }
    
    // Items for tutors
    if (user?.role === 'tutor') {
      items.push(
        {
          name: 'Answer Questions',
          href: '/tutor/questions',
          icon: <HelpCircle className="h-5 w-5" />,
        }
      );
    }
    
    // Items for admins
    if (user?.role === 'admin') {
      items.push(
        {
          name: 'Manage Tutors',
          href: '/admin/tutors',
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: 'Statistics',
          href: '/admin/statistics',
          icon: <BarChart2 className="h-5 w-5" />,
        }
      );
    }
    
    // Common items at the end
    items.push(
      {
        name: 'Profile Settings',
        href: `${user?.role === 'admin' ? '/admin' : user?.role === 'tutor' ? '/tutor' : '/dashboard'}/profile`,
        icon: <Settings className="h-5 w-5" />,
      }
    );
    
    return items;
  };
  
  const navigationItems = getNavigationItems();
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed bottom-5 right-5 z-20">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 rounded-full bg-primary-600 text-white shadow-lg focus:outline-none"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-lg font-semibold">EduQ&A</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-primary-800">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                      ${isActive(item.href)
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-100 hover:bg-primary-700'}
                    `}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary-100 hover:bg-primary-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3">Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-gray-600 bg-opacity-75" />
      )}
      
      <div className={`lg:hidden fixed inset-y-0 left-0 z-10 w-64 transition-transform transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="ml-2 text-white text-lg font-semibold">EduQ&A</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto bg-primary-800">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md 
                    ${isActive(item.href)
                      ? 'bg-primary-900 text-white'
                      : 'text-primary-100 hover:bg-primary-700'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-primary-100 hover:bg-primary-700"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden">
          <Navbar />
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;