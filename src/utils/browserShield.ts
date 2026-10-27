import React from "react";
import * as Tone from "tone";

let shieldInstalled = false;

/**
 * 1. PARCHE ANTI-CRASH DEL DOM POR TRADUCTORES DE NAVEGADOR (Chrome/Edge Google Translate)
 * Evita el famoso error fatal de React: "Failed to execute 'removeChild' / 'insertBefore' on 'Node'"
 * cuando extensiones del navegador o cambios rápidos de idioma mutan nodos de texto.
 */
function installDomMutationShield(): void {
  if (typeof Node === "undefined") return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      return child;
    }
    try {
      return originalRemoveChild.apply(this, arguments as any) as T;
    } catch {
      return child;
    }
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      try {
        return this.appendChild(newNode);
      } catch {
        return newNode;
      }
    }
    try {
      return originalInsertBefore.apply(this, arguments as any) as T;
    } catch {
      return newNode;
    }
  };
}

/**
 * 2. BLOQUEO DE TRADUCCIÓN AUTOMÁTICA EXTERNA QUE ROMPE NOMBRES DE ACORDES (Am7 -> Soy7, B7 -> Si7)
 */
function enforceNoTranslateMeta(): void {
  if (typeof document === "undefined") return;
  const htmlEl = document.documentElement;
  htmlEl.setAttribute("translate", "no");
  htmlEl.classList.add("notranslate");

  if (!document.querySelector('meta[name="google"][content="notranslate"]')) {
    const meta = document.createElement("meta");
    meta.name = "google";
    meta.content = "notranslate";
    document.head.appendChild(meta);
  }
}

/**
 * 3. DESBLOQUEADOR UNIVERSAL DE AUDIO PARA SAFARI / iOS / ANDROID / CHROME
 * Reanuda contextos en estado "suspended" o "interrupted" y limpia notas colgadas al cambiar de pestaña.
 */
function installCrossBrowserAudioShield(): void {
  if (typeof window === "undefined") return;

  const unlockAudioContexts = () => {
    try {
      if (Tone.context && Tone.context.state !== "running") {
        Tone.start().catch(() => {});
      }
      const rawCtx = (Tone.context as any)?.rawContext;
      if (
        rawCtx &&
        (rawCtx.state === "suspended" || rawCtx.state === "interrupted")
      ) {
        rawCtx.resume().catch(() => {});
      }
    } catch {}
  };

  const userEvents = ["pointerdown", "touchstart", "mousedown", "keydown"];
  userEvents.forEach((evt) => {
    window.addEventListener(evt, unlockAudioContexts, {
      passive: true,
      capture: true,
    });
  });

  // Si el usuario minimiza el navegador o bloquea el celular mientras suena, detener limpiamente
  // para evitar ráfagas de audio acumulado al volver a la pestaña.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      unlockAudioContexts();
    }
  });
}

/**
 * 4. PROTECCIÓN GLOBAL CONTRA PROMESAS RECHAZADAS (Web MIDI en Safari/Firefox, Fetch de Samples sin red, etc.)
 */
function installGlobalErrorInterceptors(): void {
  if (typeof window === "undefined") return;

  // Polyfill seguro si el navegador no soporta Web MIDI API (Safari / iOS / Firefox)
  if (typeof navigator !== "undefined" && !("requestMIDIAccess" in navigator)) {
    (navigator as any).requestMIDIAccess = () =>
      Promise.resolve({
        inputs: new Map(),
        outputs: new Map(),
        sysexEnabled: false,
        onstatechange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
      });
  }

  window.addEventListener("unhandledrejection", (event) => {
    const reasonStr = String(event.reason || "");
    if (
      reasonStr.includes("AudioContext") ||
      reasonStr.includes("MIDIAccess") ||
      reasonStr.includes("NotAllowedError") ||
      reasonStr.includes("AbortError") ||
      reasonStr.includes("decodeAudioData")
    ) {
      // Evitar que bloqueos de autoplay o permisos MIDI rompan la consola o detengan React
      event.preventDefault();
    }
  });
}

/**
 * 5. ALMACENAMIENTO LOCAL SEGURO (Evita caídas en Modo Incógnito de Safari o cuota llena)
 */
export const safeStorage = {
  getItem(key: string, fallback: string | null = null): string | null {
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  setItem(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
};

/**
 * Inicializa todos los blindajes de navegador (llamar una vez al inicio de la app)
 */
export function initBrowserShield(): void {
  if (shieldInstalled || typeof window === "undefined") return;
  shieldInstalled = true;

  installDomMutationShield();
  enforceNoTranslateMeta();
  installCrossBrowserAudioShield();
  installGlobalErrorInterceptors();
}

// Auto-ejecutar apenas se importe el módulo
initBrowserShield();

/**
 * 6. COMPONENTE ERROR BOUNDARY DE AUTO-RECUPERACIÓN (Cero pantallas negras)
 */
interface ShieldBoundaryProps {
  children: React.ReactNode;
}

interface ShieldBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<
  ShieldBoundaryProps,
  ShieldBoundaryState
> {
  constructor(props: ShieldBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ShieldBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[Rumie BrowserShield] Recuperando interfaz de error:", error);
  }

  handleRecover = () => {
    try {
      window.dispatchEvent(new CustomEvent("global-playback-stop"));
    } catch {}
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return React.createElement(
        "div",
        {
          className:
            "min-h-screen bg-[#0b0c0e] text-neutral-200 flex flex-col items-center justify-center p-6 text-center",
          translate: "no",
        },
        React.createElement(
          "div",
          {
            className:
              "max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4",
          },
          React.createElement(
            "h2",
            { className: "text-lg font-bold text-white" },
            "Restaurando sesión de audio y vista..."
          ),
          React.createElement(
            "p",
            { className: "text-xs text-neutral-400" },
            "Se detectó una interrupción externa del navegador. Tus datos están seguros."
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: this.handleRecover,
              className:
                "px-5 py-2.5 rounded-xl bg-[#EA580B] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition",
            },
            "Continuar en la Aplicación"
          )
        )
      );
    }
    return this.props.children;
  }
}