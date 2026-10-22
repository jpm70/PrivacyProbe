# PrivacyProbe — Simulador de Huella Digital y Rastreo de Navegador 🛡️🔍

[![Licencia](https://img.shields.io/badge/Licencia-MIT-cyan.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![jsPDF](https://img.shields.io/badge/jsPDF-v2.5-e11d48.svg)](https://github.com/parallax/jsPDF)
[![Web](https://img.shields.io/badge/Web-Un%20Fantasma%20en%20el%20Sistema-emerald.svg)](https://www.unfantasmaenelsistema.com/)

**PrivacyProbe** es una aplicación web didáctica e interactiva de ciberseguridad desarrollada para **[Un Fantasma en el Sistema](https://www.unfantasmaenelsistema.com/)**. Su propósito es auditar e inspeccionar en tiempo real los datos técnicos y biométricos pasivos expuestos por cualquier navegador web (*Canvas 2D, WebGL, AudioContext, fuentes locales del SO, geometría de pantalla y concurrencia de hardware*), calcular la **Entropía de Shannon** resultante y desmitificar la creencia extendida de que el *Modo Incógnito* confiere anonimato contra técnicas de huella digital (*fingerprinting*).

---

## 🌟 Características Principales

1. **Inspección Técnica en Vivo:**
   - **Canvas 2D Fingerprint:** Renderizado determinista de formas geométricas, gradientes y glifos con antialiasing para extraer un hash SHA-256 / MurmurHash3 dependiente del motor gráfico de la GPU y del sistema operativo.
   - **WebGL & GPU Unmasked:** Identificación del modelo exacto de tarjeta gráfica (`UNMASKED_RENDERER_WEBGL`) y fabricante a través de la GPU física.
   - **AudioContext Fingerprinting:** Síntesis y análisis de ondas sinusoidales procesadas con compresores dinámicos en un `OfflineAudioContext`, detectando variaciones de coma flotante de la FPU.
   - **Sondeo de Fuentes Locales:** Detección de fuentes tipográficas instaladas sin permisos mediante comparativa diferencial de anchura en píxeles.
   - **Geometría & Hardware:** Resolución nativa de pantalla, factor de escala HiDPI, núcleos de CPU (`hardwareConcurrency`) y memoria RAM estimada.
   - **Diagnóstico WebRTC Leak:** Verificación de filtraciones de IPs privadas (LAN) y públicas a través de candidatos ICE de STUN/TURN, eludiendo túneles VPN.

2. **Desmitificación Rigurosa del Modo Incógnito:**
   - Comparativa lado a lado que demuestra empíricamente cómo el modo incógnito o navegación privada únicamente borra cookies e historial local al cerrarse, dejando el 100% de la huella digital técnica completamente inalterada.

3. **Simulador de Rastreo Cruzado entre Dominios:**
   - Demostración visual de cómo 3 sitios web dispares sin relación entre sí (`tienda-online.com`, `noticias-locales.es` y `foro-salud.org`) correlacionan las visitas de un mismo usuario en milisegundos mediante su hash compuesto unificado.

4. **Matemáticas de la Entropía de Shannon:**
   - Visualización y gráficos con **Recharts** basados en la ecuación:
     $$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$
   - Comparativa interactiva de bits acumulados por vector y ratio de unicidad demográfica ($1 \text{ en } 2^H$).

5. **Laboratorio de Defensas & Mitigaciones:**
   - Simulación y alternancia de contramedidas reales:
     - **Canvas Farbling** (ruido estocástico por sesión utilizado en *Brave Browser*).
     - **Uniformidad de Cohorte** (Letterboxing, enmascaramiento de GPU y fijación de hardware implementados en *Tor Browser* y *Firefox RFP*).
     - **Hardware Clamping** a 2 núcleos.

6. **Exportación Forense en PDF Estructurado con `jsPDF`:**
   - Generación instantánea en el cliente de un informe pericial descargable en PDF con encabezado institucional, desglose de vectores, veredicto de riesgo, tabla de entropía y recomendaciones técnicas.

7. **Panel Comparativo de Perfiles y Huellas Digitales (Lado a Lado):**
   - Comparador interactivo cara a cara entre dos perfiles arbitrarios (*ej. Tu Navegador Real vs Tor Browser, Real vs Incógnito, Brave Farbling vs Tor*).
   - Cálculo del diferencial neto de entropía ($\Delta H$), reducción exponencial del espacio de búsqueda ($2^{\Delta H}$) e inspección visual simultánea de los lienzos Canvas 2D renderizados.
   - Matriz de atributos con filtros rápidos de divergencias mitigadas vs atributos idénticos y exportación del resumen al portapapeles.

8. **Sistema de Alerta Visual de Umbral Crítico de Entropía:**
   - Detección inmediata en el Hero del umbral crítico de rastreabilidad ($> 20\text{ bits}$ o $1 \text{ en } >1.000.000$ dispositivos).
   - Indicador visual dinámico con tarjeta perimetral pulsante, insignia de severidad en tiempo real, marca física de corte en el medidor de Shannon y panel explicativo sobre la pérdida de anonimato estadístico sin cookies.

9. **Glosario Interactivo & Modo de Alto Contraste:**
   - Acordeón explicativo con buscador de conceptos clave (*Canvas Fingerprinting, WebRTC Leak, Entropía de Shannon, Hardware Clamping, Farbling, Letterboxing*).
   - Modo de accesibilidad de **Alto Contraste AAA** para personas con baja visión o investigadores en entornos de alta legibilidad.

10. **Tour Guiado Interactivo con Spotlight Overlay:**
    - Recorrido paso a paso guiado para nuevos usuarios destacando puntos neurálgicos como el **panel de entropía de Shannon** y el **laboratorio de mitigaciones y defensas**.
    - Overlay dinámico con cálculo automático de coordenadas (`getBoundingClientRect`), auto-scroll suave (`scrollIntoView`), navegación por teclado (`Escape`, `ArrowRight`, `ArrowLeft`), accesos rápidos a secciones críticas y persistencia del estado en `localStorage`.
    - Activador permanente en el encabezado ("Tour Guiado") y botón flotante de acceso rápido.

---

## 🛠️ Tecnologías Empleadas

- **Frontend:** React 19, TypeScript, Vite 8
- **Estilos:** Tailwind CSS v4, Lucide React Icons
- **Gráficos de Entropía:** Recharts
- **Generación de Documentos:** jsPDF
- **Animaciones:** Motion

---

## 🚀 Instalación y Puesta en Marcha Local

### Prerrequisitos
- Node.js >= 18.x
- npm >= 9.x

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/privacy-probe-browser-fingerprint.git
cd privacy-probe-browser-fingerprint

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

### Compilar para Producción
```bash
npm run build
npm run preview
```

---

## 📊 Arquitectura del Proyecto

```
/
├── public/
│   └── assets/aistudio/icono_81a3db5b.png  # Logo de Un Fantasma en el Sistema
├── src/
│   ├── components/
│   │   ├── CrossContextSimulator.tsx      # Simulación de rastreo multiecosistema
│   │   ├── EducationalGuides.tsx          # Guía práctica y comparativa de navegadores
│   │   ├── EntropyMathExplorer.tsx        # Gráficos Recharts & cálculo de Shannon
│   │   ├── Footer.tsx                     # Pie de página oficial y enlaces
│   │   ├── ForensicReportModal.tsx        # Exportador de reportes PDF (jsPDF), JSON y MD
│   │   ├── GlossarySection.tsx            # Acordeón didáctico interactivo
│   │   ├── Header.tsx                     # Barra de navegación & modo alto contraste
│   │   ├── HeroOverview.tsx               # Panel resumen de entropía y unicidad
│   │   ├── HistoricalCases.tsx            # Casos históricos (Panopticlick, demandas)
│   │   ├── IncognitoDebunker.tsx          # Desmontador pedagógico del modo incógnito
│   │   ├── MitigationLab.tsx              # Laboratorio de farbling y defensas
│   │   ├── ProfileSwitcher.tsx            # Selector de perfiles (Real, Incógnito, Brave, Tor)
│   │   ├── TelemetryInspectionGrid.tsx    # Cuadrícula de telemetría de hardware y canvas
│   │   └── WebRTCLeakTester.tsx           # Detección de fuga de IP local y pública
│   ├── services/
│   │   ├── fingerprintCollector.ts        # Rutinas de Canvas, WebGL, Audio y Shannon
│   │   └── webRtcDetector.ts              # Detección ICE candidates WebRTC
│   ├── types/
│   │   └── fingerprint.ts                 # Interfaces TypeScript
│   ├── App.tsx                            # Componente raíz
│   ├── index.css                          # Tailwind CSS & modo de alto contraste
│   └── main.tsx                           # Punto de entrada React
├── index.html                             # Metadatos SEO y tipografías
├── package.json
└── tsconfig.json
```

---

## 🔒 Privacidad y Procesamiento Local

Esta herramienta está concebida bajo el principio de **Zero-Knowledge / Zero-Telemetry**:
- Ningún dato recopilado se almacena ni se transmite a servidores remotos.
- El 100% de los algoritmos de canvas, cómputo de shaders, inspección de audio y generación del archivo PDF se ejecutan localmente en la memoria del navegador del usuario.

---

## 📄 Créditos y Licencia

Desarrollado para fines formativos y de divulgación en ciberseguridad por **[Un Fantasma en el Sistema](https://www.unfantasmaenelsistema.com/)**.

Distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
