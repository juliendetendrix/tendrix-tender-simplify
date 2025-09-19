import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PMEQuestionnaire } from '@/components/PMEQuestionnaire';

const QuestionnairePME: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
                Questionnaire PME – Appels d'offres & Bêta Tendrix
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Aidez-nous à mieux comprendre vos besoins en matière d'appels d'offres 
                et découvrez notre programme bêta exclusif.
              </p>
            </div>
            <PMEQuestionnaire />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuestionnairePME;