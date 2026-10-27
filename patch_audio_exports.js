import fs from 'fs';
let code = fs.readFileSync('src/utils/exportAudio.ts', 'utf-8');

code = code.replace(/export function downloadBlob[\s\S]*?(?=export function exportToWAV)/,
  `export const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  
  // Intento 1: Descarga clásica
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Intento 2 (Fallback para AI Studio Sandbox): 
  // Abrimos automáticamente el Blob en una nueva pestaña después de 500ms
  // para que el usuario pueda usar el reproductor nativo de Chrome y darle a "Guardar como..."
  setTimeout(() => {
    const win = window.open(url, '_blank');
    if (!win) {
      alert("⚠️ Tu navegador bloqueó la ventana emergente (Popup). Por favor permite los popups en esta página para ver tu archivo exportado.");
    } else {
      alert(\`🎵 ¡Archivo generado! Si la descarga no se inició automáticamente debido al sandbox de Google, se abrió en una nueva pestaña. Haz clic en los 3 puntos del reproductor -> 'Descargar' o Presiona CTRL+S (CMD+S) para guardarlo como '\${filename}'.\`);
    }
  }, 500);
};

`
);

fs.writeFileSync('src/utils/exportAudio.ts', code);
console.log('triggerDownload updated!');
