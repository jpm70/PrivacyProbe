import React, { useState, useEffect, useCallback } from 'react';
import { FullFingerprintReport, WebRTCLeakData, DefenseSettings } from './types/fingerprint';
import { generateFingerprintReport } from './services/fingerprintCollector';
import { detectWebRTCLeak } from './services/webRtcDetector';
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
import { Compass, Sparkles, X } from 'lucide-react';

export default function App() {
  const [profileId, setProfileId] = useState<'real' | 'incognito' | 'brave' | 'tor' | 'custom'>('real');
  const [defenseSettings, setDefenseSettings] = useState<DefenseSettings>({
    canvasPoisoning: false,
    webglMasking: false,
    letterboxing: false,
    fontRestriction: false,
    hardwareClamping: false,
    timezoneNormalization: false,
    userAgentSpoofing: false,
  });

  const [report, setReport] = useState<FullFingerprintReport | null>(null);
  const [webRtcData, setWebRtcData] = useState<WebRTCLeakData | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [showTourBanner, setShowTourBanner] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('inspeccion');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('privacy_probe_high_contrast') === 'true';
  });

  // Check if first-time visitor to offer the tour
  useEffect(() => {
    const tourSeen = localStorage.getItem('privacy_probe_tour_completed');
    if (!tourSeen) {
      const timer = setTimeout(() => {
        setShowTourBanner(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Toggle High Contrast class on root
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('privacy_probe_high_contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('privacy_probe_high_contrast', 'false');
    }
  }, [isHighContrast]);

  const runScan = useCallback(
    async (
      targetProfile: 'real' | 'incognito' | 'brave' | 'tor' | 'custom' = profileId,
      customDefenses?: DefenseSettings
    ) => {
      setIsScanning(true);
      try {
        const [newReport, newRtc] = await Promise.all([
          generateFingerprintReport(targetProfile, customDefenses || defenseSettings),
          detectWebRTCLeak(),
        ]);
        setReport(newReport);
        setWebRtcData(newRtc);
      } catch (err) {
        console.error('Error durante el análisis de huella digital:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [profileId, defenseSettings]
  );

  useEffect(() => {
    runScan('real');
  }, []);

  const handleSelectProfile = (newProfile: 'real' | 'incognito' | 'brave' | 'tor' | 'custom') => {
    setProfileId(newProfile);

    let updatedDefenses: DefenseSettings = { ...defenseSettings };
    if (newProfile === 'real' || newProfile === 'incognito') {
      updatedDefenses = {
        canvasPoisoning: false,
        webglMasking: false,
        letterboxing: false,
        fontRestriction: false,
        hardwareClamping: false,
        timezoneNormalization: false,
        userAgentSpoofing: false,
      };
    } else if (newProfile === 'brave') {
      updatedDefenses = {
        canvasPoisoning: true,
        webglMasking: false,
        letterboxing: false,
        fontRestriction: false,
        hardwareClamping: false,
        timezoneNormalization: false,
        userAgentSpoofing: false,
      };
    } else if (newProfile === 'tor') {
      updatedDefenses = {
        canvasPoisoning: true,
        webglMasking: true,
        letterboxing: true,
        fontRestriction: true,
        hardwareClamping: true,
        timezoneNormalization: true,
        userAgentSpoofing: true,
      };
    }

    setDefenseSettings(updatedDefenses);
    runScan(newProfile, updatedDefenses);
  };

  const handleUpdateSetting = (key: keyof DefenseSettings, value: boolean) => {
    const updated = { ...defenseSettings, [key]: value };
    setDefenseSettings(updated);
    setProfileId('custom');
    runScan('custom', updated);
  };

  const handleApplyPreset = (preset: 'none' | 'brave' | 'tor' | 'max') => {
    let updated: DefenseSettings;
    if (preset === 'none') {
      updated = {
        canvasPoisoning: false,
        webglMasking: false,
        letterboxing: false,
        fontRestriction: false,
        hardwareClamping: false,
        timezoneNormalization: false,
        userAgentSpoofing: false,
      };
      setProfileId('real');
    } else if (preset === 'brave') {
      updated = {
        canvasPoisoning: true,
        webglMasking: false,
        letterboxing: false,
        fontRestriction: false,
        hardwareClamping: false,
        timezoneNormalization: false,
        userAgentSpoofing: false,
      };
      setProfileId('brave');
    } else if (preset === 'tor') {
      updated = {
        canvasPoisoning: true,
        webglMasking: true,
        letterboxing: true,
        fontRestriction: true,
        hardwareClamping: true,
        timezoneNormalization: true,
        userAgentSpoofing: true,
      };
      setProfileId('tor');
    } else {
      updated = {
        canvasPoisoning: true,
        webglMasking: true,
        letterboxing: true,
        fontRestriction: true,
        hardwareClamping: true,
        timezoneNormalization: true,
        userAgentSpoofing: true,
      };
      setProfileId('custom');
    }
    setDefenseSettings(updated);
    runScan(preset === 'max' ? 'custom' : preset === 'none' ? 'real' : preset, updated);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Fixed / Sticky Header */}
      <Header
        onRescan={() => runScan(profileId, defenseSettings)}
        isScanning={isScanning}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenReport={() => setIsReportModalOpen(true)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        onStartTour={() => setIsTourOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Profile Switcher & Simulator Bar */}
        <ProfileSwitcher
          currentProfile={profileId}
          onSelectProfile={handleSelectProfile}
          totalEntropyBits={report ? report.totalEntropyBits : 0}
        />

        {/* Hero Section: Live Entropy Overview & Composite Hash */}
        {report && <HeroOverview report={report} />}

        {/* Section 1: Incognito Debunker (The Myth of Anonymous Browsing) */}
        {report && <IncognitoDebunker report={report} />}

        {/* Section 2: Side-by-side Profile Comparison Panel */}
        <ProfileComparisonPanel currentLiveReport={report || undefined} />

        {/* Section 3: Cross-Context Tracking Simulator (3 domains with same hash) */}
        {report && <CrossContextSimulator report={report} />}

        {/* Section 3: Telemetry Inspection Grid (Canvas, WebGL, Fonts, Hardware) */}
        {report && <TelemetryInspectionGrid report={report} />}

        {/* Section 4: WebRTC Leak Diagnostics */}
        <WebRTCLeakTester />

        {/* Section 5: Shannon Entropy Mathematical Explorer (with Recharts chart) */}
        {report && <EntropyMathExplorer report={report} />}

        {/* Section 6: Interactive Defense & Mitigation Lab */}
        {report && (
          <MitigationLab
            settings={defenseSettings}
            onUpdateSetting={handleUpdateSetting}
            onApplyPreset={handleApplyPreset}
            totalEntropyBits={report.totalEntropyBits}
          />
        )}

        {/* Section 7: Historical Cases & Landmark Lawsuits */}
        <HistoricalCases />

        {/* Section 8: Interactive Glossary */}
        <GlossarySection />

        {/* Section 9: Practical Navigation Guide & Browser Advice */}
        <EducationalGuides />
      </main>

      {/* Official Footer with Website Link & Copyright */}
      <Footer />

      {/* Forensic Report Modal with structured jsPDF PDF Export */}
      {report && (
        <ForensicReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          report={report}
        />
      )}

      {/* Guided Tour Modal & Spotlight Overlay */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => {
          setIsTourOpen(false);
          setShowTourBanner(false);
        }}
      />

      {/* First-time visitor gentle prompt banner */}
      {showTourBanner && !isTourOpen && (
        <aside
          role="region"
          aria-label="Invitación a tour interactivo"
          className="fixed bottom-20 right-4 sm:right-6 z-40 max-w-sm rounded-xl border border-cyan-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-lg ring-1 ring-cyan-500/20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Tour de Bienvenida</span>
            </div>
            <button
              onClick={() => {
                setShowTourBanner(false);
                localStorage.setItem('privacy_probe_tour_completed', 'true');
              }}
              className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
              title="Descartar invitación"
              aria-label="Descartar invitación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            ¿Es tu primera vez investigando huellas digitales? Descubre los puntos críticos como el
            <strong> panel de entropía</strong> y el <strong>laboratorio de mitigaciones</strong> en 1 minuto.
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setShowTourBanner(false);
                localStorage.setItem('privacy_probe_tour_completed', 'true');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 transition-colors cursor-pointer"
            >
              Más tarde
            </button>
            <button
              onClick={() => {
                setShowTourBanner(false);
                setIsTourOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Iniciar Tour</span>
            </button>
          </div>
        </aside>
      )}

      {/* Floating Tour Button (quick access from anywhere on the page) */}
      <button
        onClick={() => setIsTourOpen(true)}
        title="Abrir Tour Guiado Interactivo"
        aria-label="Abrir Tour Guiado Interactivo"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white px-3.5 py-2 shadow-xl hover:shadow-cyan-950/50 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
      >
        <Compass className="h-4 w-4 text-cyan-400 transition-transform group-hover:rotate-45" />
        <span className="hidden sm:inline">Tour Guiado</span>
      </button>
    </div>
  );
}
