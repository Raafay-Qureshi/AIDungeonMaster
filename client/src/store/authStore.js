import { create } from 'zustand';
import api from '../api'; // We will create this file next

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  character: null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false, character: null });
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
  syncCharacter: (serverCharacter) => {
    set({ character: serverCharacter });
  }
}));

export default useAuthStore;
