import { useState } from 'react';

export const useBetaQuestionnaire = () => {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

  const openQuestionnaire = () => setIsQuestionnaireOpen(true);
  const closeQuestionnaire = () => setIsQuestionnaireOpen(false);

  return {
    isQuestionnaireOpen,
    openQuestionnaire,
    closeQuestionnaire
  };
};