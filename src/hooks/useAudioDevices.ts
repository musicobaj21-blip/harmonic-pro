import { useState, useEffect } from 'react';

export function useAudioDevices() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      if (!navigator?.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      setInputDevices(devices.filter(d => d.kind === 'audioinput'));
      setOutputDevices(devices.filter(d => d.kind === 'audiooutput'));
    } catch (e) {
      console.error('Error fetching audio devices', e);
    }
  };

  const requestPermission = () => {
    setError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Captura de audio no disponible en este dispositivo.");
        fetchDevices();
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(t => {
            try { t.stop(); } catch (_) {}
          });
          fetchDevices();
        })
        .catch((e) => {
          setError("Permiso de micrófono denegado. Abre la app en una nueva pestaña o permite el acceso.");
          // Fallback
          fetchDevices();
        });
    } catch (err) {
      setError("Error al solicitar acceso al micrófono.");
      fetchDevices();
    }
  };

  useEffect(() => {
    // Request permission first to get real device names
    requestPermission();

    if (navigator?.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', fetchDevices);
      return () => {
        if (navigator?.mediaDevices?.removeEventListener) {
          navigator.mediaDevices.removeEventListener('devicechange', fetchDevices);
        }
      };
    }
  }, []);

  return { inputDevices, outputDevices, error, requestPermission };
}
