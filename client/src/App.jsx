import React, { useState, useEffect } from 'react';
import useAuthStore from './store/authStore';
import Dashboard from './pages/Dashboard';
import Town from './pages/Town';
import Header from './components/Header';

function App() {
  const { initializeUser, fetchCharacter } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('quests');
  const [isLoading, setIsLoading] = useState(true);
    
  useEffect(() => {
    const init = async () => {
      await initializeUser();
      await fetchCharacter();
      setIsLoading(false);
    };
    init();
  }, [initializeUser, fetchCharacter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your adventure...</div>
      </div>
    );
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
