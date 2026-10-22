import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  FullFingerprintReport,
  AttributeEntropy,
} from '../types/fingerprint';
import {
  X,
  Download,
  FileText,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Monitor,
  Fingerprint,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullFingerprintReport;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'entropy' | 'vectors' | 'json'>('summary');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  if (!isOpen) return null;

  const dateStr = new Date(report.timestamp).toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(report);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_huella_${report.compositeHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Generación estructurada del PDF mediante jsPDF
   */
  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    setPdfSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 18) {
          doc.addPage();
          y = margin + 8;
          drawRunningHeader();
        }
      };

      const drawRunningHeader = () => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(margin, margin - 6, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(6, 182, 212); // cyan
        doc.text('PRIVACYPROBE · UN FANTASMA EN EL SISTEMA', margin + 2, margin - 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Hash: ${report.compositeHash}`, pageWidth - margin - 2, margin - 2, { align: 'right' });
      };

      // --- PÁGINA 1: PORTADA & ENCABEZADO ---
      // Barra decorativa superior
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 24, 'F');

      doc.setFillColor(6, 182, 212);
      doc.rect(margin, y, 3, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('INFORME FORENSE DE HUELLA DIGITAL', margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(103, 232, 249); // cyan-300
      doc.text('PrivacyProbe · Auditoría de Browser Fingerprinting & Shannon Entropy', margin + 6, y + 14);

      doc.setFontSize(7.5);
      doc.setTextColor(203, 213, 225);
      doc.text('Un Fantasma en el Sistema · https://www.unfantasmaenelsistema.com/', margin + 6, y + 19);

      y += 28;

      // Caja de Metadatos Principales
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('FECHA Y HORA:', margin + 4, y + 6);
      doc.text('PERFIL EVALUADO:', margin + 70, y + 6);
      doc.text('HASH COMPUESTO:', margin + 125, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(dateStr, margin + 4, y + 11);
      doc.text(report.profileName, margin + 70, y + 11);

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(14, 116, 144);
      doc.text(report.compositeHash, margin + 125, y + 11);

      // Línea divisoria en metadatos
      doc.setDrawColor(226, 232, 240);
      doc.line(margin + 4, y + 15, margin + contentWidth - 4, y + 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('ENTROPÍA DE SHANNON:', margin + 4, y + 21);
      doc.text('PROBABILIDAD DE UNICIDAD:', margin + 70, y + 21);
      doc.text('RATIO DEMOGRÁFICO:', margin + 125, y + 21);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${report.totalEntropyBits} bits`, margin + 42, y + 21);
      doc.text(`${report.uniquenessScore}%`, margin + 112, y + 21);
      doc.text(`1 en ${report.oneInX.toLocaleString('es-ES')}`, margin + 156, y + 21);

      y += 31;

      // Diagnóstico Ejecutivo
      const isCritical = report.totalEntropyBits > 28;
      const isProtected = report.totalEntropyBits < 15;

      doc.setFillColor(isCritical ? 254 : isProtected ? 240 : 255, isCritical ? 242 : isProtected ? 253 : 251, isCritical ? 242 : isProtected ? 244 : 235);
      doc.setDrawColor(isCritical ? 248 : isProtected ? 187 : 252, isCritical ? 113 : isProtected ? 247 : 211, isCritical ? 113 : isProtected ? 208 : 77);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(isCritical ? 153 : isProtected ? 22 : 146, isCritical ? 27 : isProtected ? 101 : 64, isCritical ? 27 : isProtected ? 52 : 14);
      doc.text(
        isCritical
          ? 'DICTAMEN: HUELLA ALTAMENTE RASTREABLE Y DISTINTIVA'
          : isProtected
          ? 'DICTAMEN: HUELLA CAMUFLADA (RESISTENCIA ACTIVA)'
          : 'DICTAMEN: HUELLA CON ENTROPÍA MEDIA',
        margin + 4,
        y + 6
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const verdictText = isCritical
        ? 'El navegador expone configuraciones y APIs de hardware que permiten a cualquier script de terceros correlacionar tu actividad entre dominios y sesiones sin requerir cookies ni permisos.'
        : isProtected
        ? 'El perfil analizado cuenta con contramedidas activas (como Canvas Farbling o RFP) que normalizan las firmas o inyectan ruido por sesión impidiendo el rastreo temporal.'
        : 'Ciertos vectores presentan variaciones individuales. El rastreo es posible dentro de audiencias acotadas.';
      doc.text(doc.splitTextToSize(verdictText, contentWidth - 8), margin + 4, y + 11);

      y += 24;

      // SECCIÓN 1: VECTORES DE RENDERIZADO Y HARDWARE
      ensureSpace(45);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1. INVENTARIO TÉCNICO DE VECTORES DE RENDERIZADO & GPU', margin + 3, y + 4.2);
      y += 8;

      const techData = [
        ['Canvas 2D Hash', report.canvas.hash, report.canvas.isPoisoned ? 'Farbling Activo (Ruido estocástico)' : 'Fijo (Expuesto)'],
        ['WebGL Vendor', report.webgl.unmaskedVendor || report.webgl.vendor, report.webgl.isMasked ? 'Enmascarado' : 'Expuesto'],
        ['WebGL Renderer (GPU)', (report.webgl.unmaskedRenderer || report.webgl.renderer).slice(0, 50), report.webgl.isMasked ? 'Enmascarado' : 'Expuesto'],
        ['AudioContext Hash', report.audio.hash, report.audio.isSpoofed ? 'Estandarizado' : 'Expuesto'],
        ['Resolución & HiDPI', `${report.display.screenWidth}x${report.display.screenHeight} @ ${report.display.devicePixelRatio}x`, report.display.isLetterboxed ? 'Letterboxed' : 'Nativa'],
        ['CPU Concurrency & RAM', `${report.hardware.hardwareConcurrency} núcleos ${report.hardware.deviceMemory ? `· ${report.hardware.deviceMemory}GB RAM` : ''}`, report.hardware.hardwareConcurrency === 2 ? 'Normalizado' : 'Nativo'],
        ['Zona Horaria & Idioma', `${report.environment.timezone} (${report.environment.timezoneOffset} min) · ${report.environment.language}`, report.environment.timezone === 'UTC' ? 'Normalizada' : 'Local'],
        ['User-Agent', report.environment.userAgent.slice(0, 75) + '...', 'Cabecera HTTP'],
        ['Fuentes del Sistema', `${report.fonts.detectedCount} de ${report.fonts.testedCount} analizadas (Hash: ${report.fonts.fontHash})`, report.fonts.isRestricted ? 'Restringidas' : 'Detectadas'],
      ];

      doc.setFontSize(7);
      techData.forEach(([label, value, status], idx) => {
        ensureSpace(6);
        const rowBg = idx % 2 === 0 ? 255 : 248;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(margin, y, contentWidth, 5.2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(label, margin + 2, y + 3.7);

        doc.setFont('courier', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(doc.splitTextToSize(value, 115)[0] || '', margin + 50, y + 3.7);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(status.includes('Expuesto') ? 185 : 22, status.includes('Expuesto') ? 28 : 101, status.includes('Expuesto') ? 28 : 52);
        doc.text(status, pageWidth - margin - 2, y + 3.7, { align: 'right' });

        y += 5.2;
      });

      y += 6;

      // SECCIÓN 2: DESGLOSE DE ENTROPÍA DE SHANNON
      ensureSpace(50);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('2. MATRIZ DE ENTROPÍA DE SHANNON POR ATRIBUTO', margin + 3, y + 4.2);
      y += 8;

      // Tabla encabezado
      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text('VECTOR ANALIZADO', margin + 2, y + 3.5);
      doc.text('CATEGORÍA', margin + 50, y + 3.5);
      doc.text('ENTROPÍA (BITS)', margin + 78, y + 3.5);
      doc.text('RATIO 1 EN X', margin + 112, y + 3.5);
      doc.text('RIESGO', margin + 140, y + 3.5);
      doc.text('¿INCÓGNITO PROTEGE?', margin + 160, y + 3.5);
      y += 5;

      report.entropyBreakdown.forEach((item, idx) => {
        ensureSpace(5.5);
        const rowBg = idx % 2 === 0 ? 255 : 248;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(margin, y, contentWidth, 5.2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        doc.text(item.name.slice(0, 28), margin + 2, y + 3.6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        doc.text(item.category, margin + 50, y + 3.6);

        doc.setFont('courier', 'bold');
        doc.setTextColor(14, 116, 144);
        doc.text(`${item.entropyBits} bits`, margin + 78, y + 3.6);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`1 en ${item.uniquenessRatio.toLocaleString('es-ES')}`, margin + 112, y + 3.6);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(
          item.riskLevel === 'Crítico' ? 185 : item.riskLevel === 'Alto' ? 217 : 22,
          item.riskLevel === 'Crítico' ? 28 : item.riskLevel === 'Alto' ? 119 : 101,
          item.riskLevel === 'Crítico' ? 28 : item.riskLevel === 'Alto' ? 6 : 52
        );
        doc.text(item.riskLevel, margin + 140, y + 3.6);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // SIEMPRE NO (Incógnito no protege)
        doc.text('NO (0% Mitigado)', margin + 160, y + 3.6);

        y += 5.2;
      });

      y += 8;

      // SECCIÓN 3: DICTAMEN DIDÁCTICO SOBRE EL MODO INCÓGNITO
      ensureSpace(42);
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(254, 202, 202); // red-200
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(153, 27, 27);
      doc.text('DESMITIFICACIÓN DEL MODO INCÓGNITO / NAVEGACIÓN PRIVADA', margin + 4, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(69, 10, 10);
      const incognitoNote =
        'El Modo Incógnito únicamente garantiza que el historial de navegación, la caché de disco y las cookies se borren LOCALMENTE al cerrar la ventana. NO modifica la aceleración por hardware de la GPU, no altera las diferencias de subpíxel del Canvas 2D, no bloquea las fuentes locales instaladas y no normaliza la resolución de pantalla. Cualquier plataforma de rastreo publicitario o antifraude genera el mismo hash exacto en modo normal que en modo incógnito.';
      doc.text(doc.splitTextToSize(incognitoNote, contentWidth - 8), margin + 4, y + 10.5);

      y += 30;

      // SECCIÓN 4: RECOMENDACIONES TÉCNICAS FORMALES
      ensureSpace(40);
      doc.setFillColor(240, 253, 244); // green-50
      doc.setDrawColor(187, 247, 208); // green-200
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(22, 101, 52);
      doc.text('RECOMENDACIONES DE MITIGACIÓN SEGÚN EL CASO DE USO', margin + 4, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 83, 45);
      const recs = [
        '1. Máximo anonimato (Periodismo, Investigación): Emplear Tor Browser o Mullvad Browser. Basados en la filosofía de "uniformidad de cohorte", todos los usuarios proyectan una huella idéntica indistinguible.',
        '2. Navegación Diaria Funcional: Emplear Brave Browser o LibreWolf. Inyectan ruido estocástico ("Farbling") por dominio que rompe la correlación entre sitios sin romper el renderizado ni páginas interactivas.',
        '3. Evitar la "Paradoja de las Extensiones": No instales extensiones de Chrome Store para alterar User-Agents o bloquear Canvas; sus fallos crean una huella aberrante extremadamente única.',
      ];
      doc.text(doc.splitTextToSize(recs.join('\n'), contentWidth - 8), margin + 4, y + 10.5);

      // --- PIE DE PÁGINA EN TODAS LAS HOJAS ---
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('PrivacyProbe · Herramienta didáctica de ciberseguridad desarrollada por Un Fantasma en el Sistema', margin, pageHeight - 7);
        doc.text(
          `Página ${i} de ${totalPages} · https://www.unfantasmaenelsistema.com/`,
          pageWidth - margin,
          pageHeight - 7,
          { align: 'right' }
        );
      }

      // Descarga directa
      doc.save(`auditoria_huella_${report.compositeHash.slice(0, 8)}.pdf`);
      setIsGeneratingPdf(false);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 4000);
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Informe Forense de Huella Digital
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {report.profileName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría técnica de entropía de Shannon y vectores de rastreo pasivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Action Bar with PDF (jsPDF), JSON, Markdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Resumen Forense
            </button>
            <button
              onClick={() => setActiveTab('entropy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'entropy'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Matriz de Entropía
            </button>
            <button
              onClick={() => setActiveTab('vectors')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'vectors'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Vectores Crudos
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              JSON
            </button>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2">
            {/* Primary Action: Export Structured PDF via jsPDF */}
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-md cursor-pointer ${
                pdfSuccess
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95'
              }`}
              title="Descargar reporte estructurado en formato PDF con formato forense"
            >
              {pdfSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>¡PDF Guardado!</span>
                </>
              ) : (
                <>
                  <Download className={`h-4 w-4 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isGeneratingPdf ? 'Compilando PDF...' : 'Exportar PDF (jsPDF)'}</span>
                </>
              )}
            </button>

            {/* Secondary Action: Download JSON */}
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Descargar archivo JSON completo para análisis forense offline"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>

            {/* Tertiary Action: Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Copiar informe en formato Markdown para informes y auditorías"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copied ? 'Copiado' : 'Markdown'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Hash Compuesto</div>
                  <div className="mt-1 font-mono text-xs font-bold text-cyan-400 truncate" title={report.compositeHash}>
                    {report.compositeHash}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Firma unificada multivectorial</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Entropía de Shannon</div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {report.totalEntropyBits} <span className="text-xs font-normal text-cyan-400">bits</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Incertidumbre resuelta (H)</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Ratio Demográfico</div>
                  <div className="mt-1 font-mono text-lg font-bold text-cyan-400">
                    1 en {report.oneInX > 1000000 ? `${(report.oneInX / 1000000).toFixed(1)}M` : report.oneInX.toLocaleString('es-ES')}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Navegadores distinguibles</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Puntuación de Unicidad</div>
                  <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
                    {report.uniquenessScore}%
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">Probabilidad de identificación</div>
                </div>
              </div>

              {/* Incognito Notice */}
              <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <h4 className="font-bold text-red-300 text-sm">
                      Evaluación Forense: Ineficacia del Modo Incógnito
                    </h4>
                    <p className="leading-relaxed">
                      El modo incógnito o navegación privada solo destruye el historial local al cerrar la ventana. <strong className="text-white">El 100% de los atributos de GPU, Canvas, Audio, resolución de pantalla y fuentes permanecen expuestos de forma idéntica</strong>. El rastreo pasivo no requiere cookies de terceros para asociar tus visitas a tu identidad de navegación.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Vector Snapshot */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-cyan-400" />
                  Principales Vectores Detectados
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Tarjeta Gráfica (WebGL):</span>
                    <span className="font-semibold text-white break-all">{report.webgl.unmaskedRenderer || report.webgl.renderer}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Hash de Lienzo 2D (Canvas):</span>
                    <span className="font-mono text-cyan-400 break-all">{report.canvas.hash}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Pantalla & Factor Escala:</span>
                    <span className="font-semibold text-white">
                      {report.display.screenWidth}x{report.display.screenHeight} @ {report.display.devicePixelRatio}x (Ventana: {report.display.windowInnerWidth}x{report.display.windowInnerHeight})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Fuentes del Sistema:</span>
                    <span className="font-semibold text-white">
                      {report.fonts.detectedCount} fuentes detectadas (Hash: {report.fonts.fontHash})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entropy' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                La siguiente tabla detalla la cantidad de información matemática (Entropía de Shannon) que cada subsistema del navegador aporta a tu huella.
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Atributo</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Entropía</th>
                      <th className="py-2.5 px-3">1 en X</th>
                      <th className="py-2.5 px-3">Riesgo</th>
                      <th className="py-2.5 px-3">¿Incógnito Protege?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    {report.entropyBreakdown.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{item.valueSummary}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{item.category}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{item.entropyBits} bits</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">1 en {item.uniquenessRatio.toLocaleString('es-ES')}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.riskLevel === 'Crítico'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : item.riskLevel === 'Alto'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-red-400 font-medium">No protegido</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vectors' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Canvas details */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-cyan-400" /> Canvas 2D
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hash:</span>
                      <span className="font-mono text-cyan-400">{report.canvas.hash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiempo de cómputo:</span>
                      <span>{report.canvas.executionTimeMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Envenenamiento (Farbling):</span>
                      <span className={report.canvas.isPoisoned ? 'text-emerald-400' : 'text-slate-400'}>
                        {report.canvas.isPoisoned ? 'Activado' : 'Desactivado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WebGL details */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-400" /> WebGL & GPU
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Renderer:</span>
                      <span className="font-semibold text-right max-w-[200px] truncate" title={report.webgl.unmaskedRenderer}>
                        {report.webgl.unmaskedRenderer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vendor:</span>
                      <span>{report.webgl.unmaskedVendor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extensiones soportadas:</span>
                      <span>{report.webgl.extensionsCount}</span>
                    </div>
                  </div>
                </div>

                {/* AudioContext details */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Info className="h-4 w-4 text-cyan-400" /> AudioContext
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audio Hash:</span>
                      <span className="font-mono text-cyan-400">{report.audio.hash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suma de muestras:</span>
                      <span>{report.audio.sampleSum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estandarizado (Tor):</span>
                      <span>{report.audio.isSpoofed ? 'Sí' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Display & Hardware */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-cyan-400" /> Pantalla & Hardware
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolución:</span>
                      <span>{report.display.screenWidth} x {report.display.screenHeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hilos CPU (Concurrency):</span>
                      <span>{report.hardware.hardwareConcurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RAM reportada:</span>
                      <span>{report.hardware.deviceMemory ? `${report.hardware.deviceMemory} GB` : 'Oculta'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800 overflow-x-auto max-h-[400px]">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer with Brand & Verification Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-t border-slate-800 bg-slate-950/80 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Un Fantasma en el Sistema</span>
            <span>·</span>
            <a
              href="https://www.unfantasmaenelsistema.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>unfantasmaenelsistema.com</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px]">
              Exporta en PDF para archivar la auditoría formalmente
            </span>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateMarkdown(report: FullFingerprintReport): string {
  const dateStr = new Date(report.timestamp).toISOString();
  return `# INFORME FORENSE DE AUDITORÍA DE HUELLA DIGITAL
**Herramienta:** PrivacyProbe  
**Investigación & Divulgación:** Un Fantasma en el Sistema (https://www.unfantasmaenelsistema.com/)  
**Fecha:** ${dateStr}  
**Perfil:** ${report.profileName}  
**Hash Compuesto:** \`${report.compositeHash}\`  
**Entropía Total de Shannon:** ${report.totalEntropyBits} bits  
**Ratio de Unicidad:** 1 en ${report.oneInX.toLocaleString('es-ES')}  
**Puntuación de Unicidad:** ${report.uniquenessScore}%  

---

## 1. Inventario de Vectores de Renderizado
- **Canvas 2D Hash:** \`${report.canvas.hash}\` (Poisoning: ${report.canvas.isPoisoned ? 'Sí' : 'No'})
- **WebGL Unmasked Vendor:** ${report.webgl.unmaskedVendor}
- **WebGL Unmasked Renderer:** ${report.webgl.unmaskedRenderer}
- **AudioContext Hash:** \`${report.audio.hash}\` (Suma: ${report.audio.sampleSum})
- **Resolución:** ${report.display.screenWidth}x${report.display.screenHeight} @ ${report.display.devicePixelRatio}x
- **Hardware Concurrency:** ${report.hardware.hardwareConcurrency} hilos
- **Memoria RAM:** ${report.hardware.deviceMemory ? `${report.hardware.deviceMemory} GB` : 'No reportada'}
- **Zona Horaria:** ${report.environment.timezone} (${report.environment.timezoneOffset} min)
- **Fuentes Detectadas:** ${report.fonts.detectedCount} de ${report.fonts.testedCount} (Hash: \`${report.fonts.fontHash}\`)

---

## 2. Matriz de Entropía de Shannon
| Atributo | Categoría | Entropía (Bits) | Ratio 1 en X | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
${report.entropyBreakdown
  .map(
    (b) =>
      `| ${b.name} | ${b.category} | ${b.entropyBits} bits | 1 en ${b.uniquenessRatio.toLocaleString('es-ES')} | ${b.riskLevel} |`
  )
  .join('\n')}

---

## 3. Dictamen sobre el Modo Incógnito
El Modo Incógnito no altera las lecturas de GPU, Canvas 2D, AudioContext ni las fuentes locales del sistema operativo. Los scripts de rastreo pasivo pueden correlacionar la identidad del usuario sin requerir cookies ni almacenamiento local.

*Generado por PrivacyProbe · Un Fantasma en el Sistema*
`;
}
