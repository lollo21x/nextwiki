import { useState, useEffect } from 'react';

const PERSONAL_MODE_KEY = 'will-pro-ai-personal-mode';

export const usePersonalMode = () => {
  const [isPersonalMode, setIsPersonalMode] = useState(() => {
    try {
      const saved = localStorage.getItem(PERSONAL_MODE_KEY);
      return saved === 'true';
    } catch (error) {
      console.error('Error loading Will Pro AI Personal mode status:', error);
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PERSONAL_MODE_KEY, isPersonalMode.toString());
    } catch (error) {
      console.error('Error saving Will Pro AI Personal mode status:', error);
    }
  }, [isPersonalMode]);

  const activatePersonalMode = () => {
    setIsPersonalMode(true);
  };

  const deactivatePersonalMode = () => {
    setIsPersonalMode(false);
  };

  return {
    isPersonalMode,
    activatePersonalMode,
    deactivatePersonalMode,
  };
};