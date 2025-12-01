import React, { createContext, useContext, useState } from 'react';
import { translations } from '@/components/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('sk');

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[language];
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return path; // Fallback to key if not found
      }
    }
    return current;
  };

  const formatDate = (date) => {
    const dayIndex = date.getDay();
    return `${t('home.days')[dayIndex]}, ${date.getDate()}. ${date.getMonth() + 1}.`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};