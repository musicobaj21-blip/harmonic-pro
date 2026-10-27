import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_fades_code = """               // Fades (interactive)
               if (clip.fadeIn > 0) {
                  gainNode.gain.setValueAtTime(0, ctxStartTime);
                  gainNode.gain.linearRampToValueAtTime(baseGain, ctxStartTime + (clip.fadeIn / 1000));
               }
               if (clip.fadeOut > 0) {
                  gainNode.gain.setValueAtTime(baseGain, ctxStartTime + clipDuration - (clip.fadeOut / 1000));
                  gainNode.gain.linearRampToValueAtTime(0, ctxStartTime + clipDuration);
               }"""

new_fades_code = """               // Calcular tiempos absolutos en el reloj del AudioContext
               const timeToStart = Math.max(0, clipStartSec - startOffsetSec);
               const startPlaybackTime = ctxStartTime + timeToStart;
               const actualPlayDuration = clipDuration - playOffset;
               const endPlaybackTime = startPlaybackTime + actualPlayDuration;

               // Obtener duraciones de fade reales o forzar 5ms Anti-Click (Zero-Crossing Fix)
               const rawFadeIn = (clip.fadeIn || 0) / 1000;
               const rawFadeOut = (clip.fadeOut || 0) / 1000;
               
               // Si empezamos en medio del clip, el fadeIn de UI puede que ya pasó.
               // Para simplificar, aplicamos un micro-fade in en startPlaybackTime si el fade de UI ya pasó.
               const isInsideFadeIn = playOffset < rawFadeIn;
               const effectiveFadeIn = isInsideFadeIn ? (rawFadeIn - playOffset) : 0;
               const safeFadeIn = effectiveFadeIn > 0.005 ? effectiveFadeIn : 0.005;
               
               // Fade Out
               const isInsideFadeOut = playOffset > (clipDuration - rawFadeOut);
               let effectiveFadeOut = rawFadeOut;
               if (isInsideFadeOut) {
                 effectiveFadeOut = clipDuration - playOffset; // Lo que quede
               }
               const safeFadeOut = effectiveFadeOut > 0.005 ? effectiveFadeOut : 0.005;

               // Dibujar la automatización de volumen del clip
               gainNode.gain.setValueAtTime(0, startPlaybackTime);
               gainNode.gain.linearRampToValueAtTime(baseGain, startPlaybackTime + safeFadeIn);

               gainNode.gain.setValueAtTime(baseGain, Math.max(startPlaybackTime + safeFadeIn, endPlaybackTime - safeFadeOut));
               gainNode.gain.linearRampToValueAtTime(0, endPlaybackTime);"""

content = content.replace(old_fades_code, new_fades_code)

# We also need to remove the previous timeToStart declaration because we moved it up.
old_start_code = """               const timeToStart = Math.max(0, clipStartSec - startOffsetSec);
               source.start(ctxStartTime + timeToStart, playOffset);"""
new_start_code = """               source.start(startPlaybackTime, playOffset);"""
content = content.replace(old_start_code, new_start_code)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
