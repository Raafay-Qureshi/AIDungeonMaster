import React, { useState, useEffect } from 'react';
import useAuthStore from './store/authStore';
import Dashboard from './pages/Dashboard';
import Town from './pages/Town';
import AuthPage from './components/AuthPage';
import Header from './components/Header';

function App() {
  const { isAuthenticated, token, fetchCharacter } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('quests');
    
  useEffect(() => {
      if (isAuthenticated) {
          fetchCharacter();
      }
  }, [isAuthenticated, token, fetchCharacter]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {currentPage === 'quests' && <Dashboard />}
      {currentPage === 'town' && <Town />}
    </div>
  );
}

export default App;
