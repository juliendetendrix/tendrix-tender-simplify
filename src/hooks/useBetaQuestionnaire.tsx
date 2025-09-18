import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type BetaQuestionnaireContextValue = {
  isQuestionnaireOpen: boolean;
  openQuestionnaire: () => void;
  closeQuestionnaire: () => void;
};

const BetaQuestionnaireContext = createContext<BetaQuestionnaireContextValue | undefined>(undefined);

export const BetaQuestionnaireProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  const openQuestionnaire = useCallback(() => setIsQuestionnaireOpen(true), []);
  const closeQuestionnaire = useCallback(() => setIsQuestionnaireOpen(false), []);

  const value = useMemo(() => ({ isQuestionnaireOpen, openQuestionnaire, closeQuestionnaire }), [isQuestionnaireOpen, openQuestionnaire, closeQuestionnaire]);

  return (
    <BetaQuestionnaireContext.Provider value={value}>
      {children}
    </BetaQuestionnaireContext.Provider>
  );
};

export const useBetaQuestionnaire = (): BetaQuestionnaireContextValue => {
  const ctx = useContext(BetaQuestionnaireContext);
  if (!ctx) throw new Error('useBetaQuestionnaire must be used within a BetaQuestionnaireProvider');
  return ctx;
};