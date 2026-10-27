import { useEffect } from "react";
import JazzStandards from "./components/JazzStandards";
import { getAudioContext } from "./utils/audio";
import { interactiveAnalysisAudio } from "./utils/interactiveAnalysisAudio";
import { initBrowserShield, AppErrorBoundary } from "./utils/browserShield";

initBrowserShield();

export default function App() {
  const initAudio = async () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      const bandCtx = interactiveAnalysisAudio.getAudioContext();
      if (bandCtx && bandCtx.state === "suspended") {
        await bandCtx.resume();
      }
    } catch (e) {
      console.warn("Could not start Audio Context:", e);
    }
  };

  useEffect(() => {
    const handleGesture = () => {
      initAudio();
    };

    window.addEventListener("click", handleGesture);
    window.addEventListener("keydown", handleGesture);

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <div
        id="main-app"
        translate="no"
        className="notranslate min-h-screen bg-[#090a0d] text-neutral-200 font-sans antialiased selection:bg-[#f25100] selection:text-white flex flex-col print:bg-white print:text-black"
      >
        <JazzStandards isVisible={true} />
      </div>
    </AppErrorBoundary>
  );
}