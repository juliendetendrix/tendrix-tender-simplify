import BetaQuestionnaire from '@/components/BetaQuestionnaire';
import { useBetaQuestionnaire } from '@/hooks/useBetaQuestionnaire';

const GlobalBetaQuestionnaire = () => {
  const { isQuestionnaireOpen, closeQuestionnaire } = useBetaQuestionnaire();

  return <BetaQuestionnaire isOpen={isQuestionnaireOpen} onClose={closeQuestionnaire} />;
};

export default GlobalBetaQuestionnaire;