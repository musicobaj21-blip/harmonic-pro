import re

with open("src/components/MidiStudio.tsx", "r") as f:
    content = f.read()

old_calc = """               // Calcular tiempos absolutos en el reloj del AudioContext
               const timeToStart = Math.max(0, clipStartSec - startOffsetSec);
               const startPlaybackTime = ctxStartTime + timeToStart;
               const actualPlayDuration = clipDuration - playOffset;
               const endPlaybackTime = startPlaybackTime + actualPlayDuration;"""

new_calc = """               // Calcular tiempos absolutos en el reloj del AudioContext
               const timeToStart = Math.max(0, clipStartSec - startOffsetSec);
               const startPlaybackTime = ctxStartTime + timeToStart;
               const trimOffsetSec = (clip.trimOffset || 0) / 1000;
               const playOffset = Math.max(0, startOffsetSec - clipStartSec) + trimOffsetSec;
               const actualPlayDuration = clipDuration - Math.max(0, startOffsetSec - clipStartSec);
               const endPlaybackTime = startPlaybackTime + actualPlayDuration;"""

old_offset = """               const startOffsetSec = startOffset / 1000;
               const playOffset = Math.max(0, startOffsetSec - clipStartSec);
               
               if (playOffset >= clipDuration) return;"""

new_offset = """               const startOffsetSec = startOffset / 1000;
               const timelineOffset = Math.max(0, startOffsetSec - clipStartSec);
               
               if (timelineOffset >= clipDuration) return;"""

# Replace playOffset -> timelineOffset where necessary (like fades)
old_fade = """               // Si empezamos en medio del clip, el fadeIn de UI puede que ya pasó.
               // Para simplificar, aplicamos un micro-fade in en startPlaybackTime si el fade de UI ya pasó.
               const isInsideFadeIn = playOffset < rawFadeIn;
               const effectiveFadeIn = isInsideFadeIn ? (rawFadeIn - playOffset) : 0;
               const safeFadeIn = effectiveFadeIn > 0.005 ? effectiveFadeIn : 0.005;
               
               // Fade Out
               const isInsideFadeOut = playOffset > (clipDuration - rawFadeOut);
               let effectiveFadeOut = rawFadeOut;
               if (isInsideFadeOut) {
                 effectiveFadeOut = clipDuration - playOffset; // Lo que quede
               }"""

new_fade = """               // Si empezamos en medio del clip, el fadeIn de UI puede que ya pasó.
               // Para simplificar, aplicamos un micro-fade in en startPlaybackTime si el fade de UI ya pasó.
               const isInsideFadeIn = timelineOffset < rawFadeIn;
               const effectiveFadeIn = isInsideFadeIn ? (rawFadeIn - timelineOffset) : 0;
               const safeFadeIn = effectiveFadeIn > 0.005 ? effectiveFadeIn : 0.005;
               
               // Fade Out
               const isInsideFadeOut = timelineOffset > (clipDuration - rawFadeOut);
               let effectiveFadeOut = rawFadeOut;
               if (isInsideFadeOut) {
                 effectiveFadeOut = clipDuration - timelineOffset; // Lo que quede
               }"""

old_start = """               merger.connect(trackInputNode);

               source.start(startPlaybackTime, playOffset);"""

new_start = """               merger.connect(trackInputNode);

               source.start(startPlaybackTime, playOffset, actualPlayDuration);"""

content = content.replace(old_offset, new_offset)
content = content.replace(old_calc, new_calc)
content = content.replace(old_fade, new_fade)
content = content.replace(old_start, new_start)

with open("src/components/MidiStudio.tsx", "w") as f:
    f.write(content)
