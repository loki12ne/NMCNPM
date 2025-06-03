// Description: Main layout component for the application, including sidebar and main content
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import SignInModal from '../modals/SignInModal';
import AskQuestionModal from '../modals/AskQuestionModal';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout: React.FC = () => {
  const { isLoggedIn } = useAuth(); //lấy trạng thái đăng nhập
  const [showSignInModal, setShowSignInModal] = useState(false); //hiển thị trạng thái đăng nhập
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false); //hiển thị cửa sổ đặt câu hỏi

  // Hàm xử lý khi người dùng muốn thêm câu hỏi
  const handleAddQuestion = () => {
    if (!isLoggedIn) {
      setShowSignInModal(true);
    } else {
      setShowAskQuestionModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onAddQuestion={handleAddQuestion} />
      <MainContent />
      
      {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      {showAskQuestionModal && <AskQuestionModal onClose={() => setShowAskQuestionModal(false)} />}
    </div>
  );
};

export default AppLayout;