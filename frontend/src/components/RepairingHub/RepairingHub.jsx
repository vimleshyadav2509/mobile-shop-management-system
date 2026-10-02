import React, { useState } from 'react';
import { ArrowLeft, Wrench } from 'lucide-react';
import RepairServiceView from '../Customer/RepairServiceView';
import RepairTrackingView from '../Customer/RepairTrackingView';
import RepairEstimator from './RepairEstimator';
import { useLanguage } from '../../context/LanguageContext';

export default function RepairingHub({ onBackToHome }) {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('service'); // 'service' | 'tracking' | 'estimator'
  const [trackedJobId, setTrackedJobId] = useState('AMS-101');

  const handleTrackJob = (jobId) => {
    setTrackedJobId(jobId);
    setCurrentView('tracking');
  };

  if (currentView === 'tracking') {
    return (
      <RepairTrackingView
        initialJobId={trackedJobId}
        onBack={() => setCurrentView('service')}
      />
    );
  }

  if (currentView === 'estimator') {
    return (
      <div className="space-y-4 pb-8 animate-in fade-in duration-150">
        <div className="flex items-center gap-2 pb-1">
          <button
            type="button"
            onClick={() => setCurrentView('service')}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-[#102A43] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            {t('buying.calculator') || 'Repair Price Estimator'}
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-xs">
          <RepairEstimator />
        </div>
      </div>
    );
  }

  return (
    <RepairServiceView
      onBack={onBackToHome}
      onTrackJob={handleTrackJob}
      onOpenEstimator={() => setCurrentView('estimator')}
    />
  );
}
