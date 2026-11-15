import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';
export type Language = 'id' | 'en';

interface PreferencesContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  showRipple: boolean;
  setShowRipple: (show: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  hasCompletedTour: boolean;
  setHasCompletedTour: (completed: boolean) => void;
  restartTour: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('greateye_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('greateye_lang');
    return saved === 'en' || saved === 'id' ? saved : 'id';
  });

  // Ripple effect on map shortcuts
  const [showRipple, setShowRippleState] = useState<boolean>(() => {
    const saved = localStorage.getItem('greateye_ripple');
    return saved !== null ? saved === 'true' : true;
  });

  // Settings modal visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Onboarding tour status
  const [hasCompletedTour, setHasCompletedTourState] = useState<boolean>(() => {
    return localStorage.getItem('greateye_tour_completed') === 'true';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('greateye_theme', newTheme);
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('greateye_lang', newLang);
  };

  const setShowRipple = (show: boolean) => {
    setShowRippleState(show);
    localStorage.setItem('greateye_ripple', String(show));
  };

  const setHasCompletedTour = (completed: boolean) => {
    setHasCompletedTourState(completed);
    localStorage.setItem('greateye_tour_completed', String(completed));
  };

  const restartTour = () => {
    setHasCompletedTour(false);
    setIsSettingsOpen(false);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Synchronize document classes and data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        showRipple,
        setShowRipple,
        isSettingsOpen,
        setIsSettingsOpen,
        openSettings,
        closeSettings,
        hasCompletedTour,
        setHasCompletedTour,
        restartTour,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
