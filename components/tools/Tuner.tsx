import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { Mic, MicOff, RefreshCw } from 'lucide-react';

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const Tuner: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<number>(0);
  const [note, setNote] = useState<string>("-");
  const [detune, setDetune] = useState<number>(0); // Cents off
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-correlation algorithm for pitch detection
  const autoCorrelate = (buf: Float32Array, sampleRate: number): number => {
    // Implements the YIN algorithm simplified or standard autocorrelation
    let SIZE = buf.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) return -1; // Signal too weak

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++)
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++)
      if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++)
        c[i] = c[i] + buf[j] * buf[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    // Parabolic interpolation
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const updatePitch = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const buflen = 2048;
    const buf = new Float32Array(buflen);
    analyserRef.current.getFloatTimeDomainData(buf);
    const ac = autoCorrelate(buf, audioContextRef.current.sampleRate);

    if (ac !== -1) {
      const noteNum = 12 * (Math.log(ac / 440) / Math.log(2)) + 57; // Note number standard (A4 = 69, here 57 is A3 relative offset fix logic)
      // Actually standard formula: note = 12 * log2(freq / 440) + 69
      const standardNoteNum = 12 * (Math.log(ac / 440) / Math.log(2)) + 69;
      const noteIndex = Math.round(standardNoteNum) % 12;
      
      const noteName = NOTE_STRINGS[noteIndex];
      const detuneValue = Math.floor((standardNoteNum - Math.round(standardNoteNum)) * 100);

      setPitch(Math.round(ac));
      setNote(noteName || "-");
      setDetune(detuneValue);
    } 

    requestRef.current = requestAnimationFrame(updatePitch);
  }, []);

  const startTuner = async () => {
    try {
      await audioEngine.resumeContext();
      const stream = await audioEngine.getMediaStream();
      streamRef.current = stream;
      
      const audioCtx = audioEngine.getContext();
      if (!audioCtx) throw new Error("Audio Context not available");
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsListening(true);
      setError(null);
      updatePitch();
    } catch (err) {
      setError("No se pudo acceder al micrófono. Por favor permite el acceso.");
      console.error(err);
    }
  };

  const stopTuner = () => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    cancelAnimationFrame(requestRef.current);
    setIsListening(false);
    setPitch(0);
    setNote("-");
    setDetune(0);
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  // Needle rotation calculation (-45deg to 45deg for -50 to +50 cents)
  const rotation = Math.max(-45, Math.min(45, detune * 0.9));
  const isInTune = Math.abs(detune) < 5 && pitch > 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-xl shadow-2xl min-h-[500px] w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-emerald-400">Afinador Cromático</h2>
      
      <div className="relative w-72 h-40 bg-slate-800 rounded-t-full border-4 border-slate-700 overflow-hidden mb-8">
        {/* Gauge marks */}
        <div className="absolute bottom-0 left-1/2 w-1 h-4 bg-emerald-500 -translate-x-1/2 z-10"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-slate-500 -translate-x-1/2 rotate-12 origin-bottom"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-slate-500 -translate-x-1/2 -rotate-12 origin-bottom"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-slate-500 -translate-x-1/2 rotate-[25deg] origin-bottom"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-slate-500 -translate-x-1/2 -rotate-[25deg] origin-bottom"></div>

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-32 bg-red-500 origin-bottom needle-transition rounded-full"
          style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            backgroundColor: isInTune ? '#10b981' : '#ef4444'
          }}
        ></div>
        
        {/* Pivot */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-200 rounded-full -translate-x-1/2 translate-y-1/2 z-20"></div>
      </div>

      <div className="text-center mb-8">
        <div className={`text-8xl font-bold transition-colors ${isInTune ? 'text-emerald-400' : 'text-white'}`}>
          {note}
        </div>
        <div className="text-xl text-slate-400 font-mono mt-2">
          {pitch > 0 ? `${pitch} Hz` : '-- Hz'}
        </div>
        <div className="text-sm text-slate-500 mt-1">
          {detune > 0 ? `+${detune}` : detune} cents
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4 text-sm max-w-md text-center">
          {error}
        </div>
      )}

      <button
        onClick={isListening ? stopTuner : startTuner}
        className={`flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold transition-all ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20' 
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
        }`}
      >
        {isListening ? <><MicOff className="w-5 h-5" /> Detener</> : <><Mic className="w-5 h-5" /> Comenzar a Afinar</>}
      </button>
      
      <p className="mt-6 text-slate-500 text-sm">
        Asegúrate de estar en un ambiente silencioso para mejores resultados.
      </p>
    </div>
  );
};

export default Tuner;
