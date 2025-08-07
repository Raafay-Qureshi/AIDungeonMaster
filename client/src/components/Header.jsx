import React from 'react';
import useAuthStore from '../store/authStore';

const Header = ({ currentPage, setCurrentPage }) => {
    const { setToken } = useAuthStore();

    const navButtonStyle = (page) => 
        `px-4 py-2 font-bold rounded-md transition-colors ${
            currentPage === page 
            ? 'bg-yellow-500 text-gray-900' 
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`;

    return (
        <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold font-serif text-white">AI Dungeon Master</h1>
                <button onClick={() => setToken(null)} className="px-4 py-2 font-bold text-gray-900 bg-red-500 rounded-md hover:bg-red-600">
                    Logout
                </button>
            </div>
            <nav className="flex space-x-4">
                <button onClick={() => setCurrentPage('quests')} className={navButtonStyle('quests')}>
                    Quests
                </button>
                <button onClick={() => setCurrentPage('town')} className={navButtonStyle('town')}>
                    Town
                </button>
            </nav>
        </header>
    );
};

export default Header;
