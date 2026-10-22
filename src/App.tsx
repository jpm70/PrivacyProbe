import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Compass, Sparkles, X } from 'lucide-react';
import type { DefenseSettings, FullFingerprintReport, ProfileId, StudyId } from './types/fingerprint';
import { ALL_DEFENSES, NO_DEFENSES, generateFingerprintReport } from './services/fingerprintCollector';
import { DEFAULT_STUDY, STUDIES, estimateEntropy } from './services/entropyModel';
import { STORAGE, readStorage, useUi, writeStorage } from './i18n';
import { Header } from './components/Header';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { HeroOverview } from './components/HeroOverview';
import { IncognitoDebunker } from './components/IncognitoDebunker';
import { ProfileComparisonPanel } from './components/ProfileComparisonPanel';
import { CrossContextSimulator } from './components/CrossContextSimulator';
import { TelemetryInspectionGrid } from './components/TelemetryInspectionGrid';
import { WebRTCLeakTester } from './components/WebRTCLeakTester';
import { EntropyMathExplorer } from './components/EntropyMathExplorer';
import { MitigationLab } from './components/MitigationLab';
import { HistoricalCases } from './components/HistoricalCases';
import { GlossarySection } from './components/GlossarySection';
import { EducationalGuides } from './components/EducationalGuides';
import { Footer } from './components/Footer';
import { ForensicReportModal } from './components/ForensicReportModal';
import { GuidedTour } from './components/GuidedTour';

const PRESET_SETTINGS: Record<'brave' | 'tor', DefenseSettings> = {
  brave: { ...NO_DEFENSES, canvasPoisoning: true },
  tor: ALL_DEFENSES,
};

function initialStudy(): StudyId {
  const saved = readStorage(STORAGE.study);
  return saved && saved in STUDIES ? (saved as StudyId) : DEFAULT_STUDY;
}

export default function App() {
  const { t } = useUi();
  const [profileId, setProfileId] = useState<ProfileId>('real');
  const [defenses, setDefenses] = useState<DefenseSettings>(NO_DEFENSES);
  const [report, setReport] = useState<FullFingerprintReport | null>(null);
  const [realReport, setRealReport] = useState<FullFingerprintReport | null>(null);
  const [study, setStudyState] = useState<StudyId>(initialStudy);
  const [isScanning, setIsScanning] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showTourBanner, setShowTourBanner] = useState(false);

  const setStudy = (s: StudyId) => {
    setStudyState(s);
    writeStorage(STORAGE.study, s);
  };

  useEffect(() => {
    if (readStorage(STORAGE.tour)) return;
    const timer = setTimeout(() => setShowTourBanner(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  const runScan = useCallback(async (target: ProfileId, settings: DefenseSettings) => {
    setIsScanning(true);
    try {
      const next = await generateFingerprintReport(target, settings);
      setReport(next);
      if (target === 'real') setRealReport(next);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    runScan('real', NO_DEFENSES);
  }, [runScan]);

  const selectProfile = (p: ProfileId) => {
    const settings = p === 'brave' || p === 'tor' ? PRESET_SETTINGS[p] : p === 'custom' ? defenses : NO_DEFENSES;
    setProfileId(p);
    setDefenses(settings);
    runScan(p, settings);
  };

  const updateDefense = (key: keyof DefenseSettings, value: boolean) => {
    const settings = { ...defenses, [key]: value };
    setDefenses(settings);
    setProfileId('custom');
    runScan('custom', settings);
  };

  const applyPreset = (preset: 'none' | 'brave' | 'tor') => {
    if (preset === 'none') return selectProfile('real');
    selectProfile(preset);
  };

  const estimate = useMemo(() => (report ? estimateEntropy(report, study) : null), [report, study]);

  const closeTourBanner = () => {
    setShowTourBanner(false);
    writeStorage(STORAGE.tour, '1');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Header
        onRescan={() => runScan(profileId, defenses)}
        isScanning={isScanning}
        onOpenReport={() => setIsReportOpen(true)}
        onStartTour={() => setIsTourOpen(true)}
        reportReady={!!report}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <ProfileSwitcher current={profileId} onSelect={selectProfile} sumBits={estimate?.sumBits ?? 0} isScanning={isScanning} />

        {report && estimate ? (
          <>
            <HeroOverview report={report} estimate={estimate} study={study} onStudyChange={setStudy} />
            <IncognitoDebunker report={report} />
            <ProfileComparisonPanel liveReport={realReport} study={study} />
            <CrossContextSimulator report={report} />
            <TelemetryInspectionGrid report={report} estimate={estimate} />
            <WebRTCLeakTester />
            <EntropyMathExplorer estimate={estimate} study={study} onStudyChange={setStudy} />
            <MitigationLab
              settings={defenses}
              profileId={profileId}
              onUpdate={updateDefense}
              onPreset={applyPreset}
              estimate={estimate}
            />
          </>
        ) : (
          <div className="py-24 text-center text-sm text-slate-400" role="status">
            {t('Analizando tu navegador…', 'Analysing your browser…')}
          </div>
        )}

        <HistoricalCases />
        <GlossarySection />
        <EducationalGuides />
      </main>

      <Footer />

      {report && estimate && (
        <ForensicReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} report={report} estimate={estimate} />
      )}

      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => {
          setIsTourOpen(false);
          closeTourBanner();
        }}
      />

      {showTourBanner && !isTourOpen && (
        <aside
          aria-label={t('Invitación al recorrido guiado', 'Guided tour invitation')}
          className="fixed bottom-20 right-4 sm:right-6 z-40 max-w-sm rounded-xl border border-cyan-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>{t('Recorrido guiado', 'Guided tour')}</span>
            </div>
            <button
              onClick={closeTourBanner}
              className="text-slate-400 hover:text-slate-100 p-0.5 cursor-pointer"
              aria-label={t('Cerrar', 'Close')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {t(
              '¿Primera vez? En un minuto te enseño dónde mirar: tu huella, la estimación de entropía y el laboratorio de defensas.',
              'First time here? In one minute I will show you where to look: your fingerprint, the entropy estimate and the defence lab.'
            )}
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button onClick={closeTourBanner} className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 cursor-pointer">
              {t('Más tarde', 'Later')}
            </button>
            <button
              onClick={() => {
                setShowTourBanner(false);
                setIsTourOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{t('Empezar', 'Start')}</span>
            </button>
          </div>
        </aside>
      )}

      <button
        onClick={() => setIsTourOpen(true)}
        aria-label={t('Abrir el recorrido guiado', 'Open the guided tour')}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 px-3.5 py-2 shadow-xl text-xs font-semibold backdrop-blur-md cursor-pointer group"
      >
        <Compass className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-45" />
        <span className="hidden sm:inline">{t('Recorrido', 'Tour')}</span>
      </button>
    </div>
  );
}
