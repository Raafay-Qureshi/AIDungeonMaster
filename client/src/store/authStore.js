import { create } from 'zustand';
import api from '../api';

// Generate or retrieve a unique local user ID
const getLocalUserId = () => {
  let userId = localStorage.getItem('localUserId');
  if (!userId) {
    userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('localUserId', userId);
  }
  return userId;
};

const useAuthStore = create((set, get) => ({
  localUserId: getLocalUserId(),
  isAuthenticated: true, // Always authenticated in local mode
  character: null,
  
  initializeUser: async () => {
    const userId = get().localUserId;
    try {
      // Try to fetch existing character or create new one
      const response = await api.post('/users/init', { localUserId: userId });
      set({ character: response.data.character });
    } catch (error) {
      console.error("Failed to initialize user.", error);
    }
  },
  
  fetchCharacter: async () => {
    try {
      const response = await api.get('/users/me/character');
      set({ character: response.data });
    } catch (error) {
      console.error("Failed to fetch character data.", error);
    }
  },
  
  updateCharacterXp: (amount) => {
    const currentChar = get().character;
    if (currentChar) {
      set({ character: { ...currentChar, xp: currentChar.xp + amount } });
    }
  },
  
  setCharacter: (character) => {
    set({ character });
  },
  
  syncCharacter: (serverCharacter) => {
    set({ character: serverCharacter });
  }
}));

export default useAuthStore;
