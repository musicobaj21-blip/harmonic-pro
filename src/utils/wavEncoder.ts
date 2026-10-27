/**
 * Codificador WAV canónico en JavaScript puro (16-bit PCM little-endian).
 * Convierte canales de audio Float32Array a un DataView con la cabecera estándar RIFF/WAVE
 * y genera un Blob con MIME type 'audio/wav'.
 */

export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  const numChannels = Math.max(1, channels.length);
  const numSamples = channels[0]?.length || 0;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8; // 2 bytes
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // Escribir cadenas ASCII
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. Chunk RIFF
  writeString(0, "RIFF");
  view.setUint32(4, totalSize - 8, true); // File length - 8 bytes
  writeString(8, "WAVE");

  // 2. Sub-chunk "fmt "
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);            // Subchunk1Size = 16 para formato PCM estándar
  view.setUint16(20, 1, true);             // AudioFormat = 1 (PCM lineal sin compresión)
  view.setUint16(22, numChannels, true);   // Número de canales (1 = Mono, 2 = Estéreo)
  view.setUint32(24, sampleRate, true);    // Frecuencia de muestreo (ej: 44100 / 48000 Hz)
  view.setUint32(28, byteRate, true);      // ByteRate = SampleRate * BlockAlign
  view.setUint16(32, blockAlign, true);    // BlockAlign = NumChannels * BytesPerSample
  view.setUint16(34, bitsPerSample, true); // BitsPerSample = 16

  // 3. Sub-chunk "data"
  writeString(36, "data");
  view.setUint32(40, dataSize, true);      // dataSize = NumSamples * NumChannels * 2

  // 4. Muestras PCM cuantizadas e intercaladas (Interleaved 16-bit PCM)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch] ? channels[ch][i] : 0;
      // Clamping estricto para evitar overflow
      if (sample > 1) sample = 1;
      else if (sample < -1) sample = -1;

      // Conversión de float [-1.0, 1.0] a signed int16 [-32768, 32767]
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}
