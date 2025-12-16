import React, { useEffect, useState, useRef } from 'react';
import { audioEngine } from '../../services/audioEngine';
import { InstrumentType } from '../../types';
import { Grid, Music, Guitar, Wind, Volume2, Info, Hand } from 'lucide-react';

// --- SHARED TYPES ---
interface NoteDef {
  name: string;
  freq: number;
}

// --- DATA: PIANO (88 Keys) ---
const generatePianoKeys = () => {
  const keys = [];
  const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  let currentFreq = 27.5;
  
  for (let i = 0; i < 88; i++) {
    const noteIndex = i % 12;
    const octave = Math.floor((i + 9) / 12);
    const noteName = notes[noteIndex];
    const isBlack = noteName.includes('#');
    
    keys.push({
      id: i,
      name: `${noteName}${octave}`,
      label: noteName,
      freq: currentFreq,
      isBlack,
      octave
    });
    
    currentFreq = currentFreq * Math.pow(2, 1/12);
  }
  return keys;
};

const PIANO_KEYS = generatePianoKeys();

// --- DATA: GUITAR CHORDS ---
type GuitarChord = number[]; // [E, A, D, G, B, e]
type GuitarFingering = number[]; // [0, 0, 1, 2, 3, 0] (0=None, 1=Index, 2=Middle, 3=Ring, 4=Pinky)

const GUITAR_TUNING = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

const CHORD_LIBRARY: Record<string, Record<string, { frets: GuitarChord, fingers: GuitarFingering, explanation: string }>> = {
  'C': {
    'Mayor': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], explanation: 'Do Mayor. Dedo 1 en Si, Dedo 2 en Re, Dedo 3 en La.' },
    'Menor': { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], explanation: 'Do Menor. Cejilla en traste 3.' },
    '7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], explanation: 'Do Séptima. Añade el dedo meñique en Sol (3ra cuerda).' },
    'Maj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], explanation: 'Do Maj7. Levanta el dedo índice.' },
  },
  'D': {
    'Mayor': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], explanation: 'Re Mayor. Triángulo clásico.' },
    'Menor': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], explanation: 'Re Menor.' },
  },
  'E': {
    'Mayor': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], explanation: 'Mi Mayor. Usa todas las cuerdas.' },
    'Menor': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], explanation: 'Mi Menor. Solo dos dedos.' },
  },
  'G': {
    'Mayor': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], explanation: 'Sol Mayor.' },
  },
  'A': {
    'Mayor': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], explanation: 'La Mayor. Tres dedos en línea.' },
    'Menor': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], explanation: 'La Menor.' },
  },
};

const QUALITIES = ['Mayor', 'Menor', '7', 'Maj7', 'sus4', 'dim', 'aug', '9', '11', '13'];
const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// --- DATA: FLUTE FINGERINGS ---
type FluteFingering = number[];
interface RecorderNote {
  name: string;
  holes: FluteFingering;
  explanation: string;
  freq: number;
}
const RECORDER_NOTES: RecorderNote[] = [
  { name: 'DO (C5)', freq: 523.25, holes: [1, 1, 1, 1, 1, 1, 1, 1], explanation: 'Todos los orificios tapados. Soplo suave.' },
  { name: 'RE (D5)', freq: 587.33, holes: [1, 1, 1, 1, 1, 1, 1, 0], explanation: 'Destapar el orificio inferior.' },
  { name: 'MI (E5)', freq: 659.25, holes: [1, 1, 1, 1, 1, 1, 0, 0], explanation: 'Mano derecha: solo dedo índice.' },
  { name: 'FA (F5)', freq: 698.46, holes: [1, 1, 1, 1, 0, 1, 1, 0], explanation: 'Digitación barroca.' },
  { name: 'SOL (G5)', freq: 783.99, holes: [1, 1, 1, 1, 0, 0, 0, 0], explanation: 'Solo mano izquierda.' },
  { name: 'LA (A5)', freq: 880.00, holes: [1, 1, 1, 0, 0, 0, 0, 0], explanation: 'Dos dedos superiores.' },
  { name: 'SI (B5)', freq: 987.77, holes: [1, 1, 0, 0, 0, 0, 0, 0], explanation: 'Solo dedo índice superior.' },
  { name: 'DO Agudo (C6)', freq: 1046.50, holes: [1, 0, 1, 0, 0, 0, 0, 0], explanation: 'Invertir índice y medio.' },
  { name: 'RE Agudo (D6)', freq: 1174.66, holes: [0, 0, 1, 0, 0, 0, 0, 0], explanation: 'Solo dedo medio izquierdo (abierto atrás).' },
];

const Profelofono: React.FC = () => {
  const [instrument, setInstrument] = useState<InstrumentType>('profelofono');
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  // -- GUITAR STATE --
  const [guitarMode, setGuitarMode] = useState<'library' | 'builder'>('library');
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedQuality, setSelectedQuality] = useState('Mayor');
  const [customFrets, setCustomFrets] = useState<GuitarChord>([-1, -1, -1, -1, -1, -1]);
  const [customFingers, setCustomFingers] = useState<GuitarFingering>([0, 0, 0, 0, 0, 0]);

  // -- FLUTE STATE --
  const [fluteHoles, setFluteHoles] = useState<FluteFingering>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [fluteDetectedNote, setFluteDetectedNote] = useState<string>('Silencio');

  useEffect(() => {
    if (instrument === 'piano' && pianoContainerRef.current) {
       const middleKey = 40 * 40; 
       pianoContainerRef.current.scrollLeft = middleKey - (pianoContainerRef.current.clientWidth / 2);
    }
  }, [instrument]);

  const toggleFluteHole = (index: number) => {
    const newHoles = [...fluteHoles];
    if (newHoles[index] === 0) newHoles[index] = 1;
    else if (newHoles[index] === 1) newHoles[index] = 0.5;
    else newHoles[index] = 0;
    setFluteHoles(newHoles);
    detectFluteNote(newHoles);
  };

  const detectFluteNote = (holes: FluteFingering) => {
    const match = RECORDER_NOTES.find(n => JSON.stringify(n.holes) === JSON.stringify(holes));
    setFluteDetectedNote(match ? match.name : (holes.every(h => h === 0) ? "Silencio (Aire)" : "Posición desconocida"));
  };

  const playFluteCurrent = () => {
    const match = RECORDER_NOTES.find(n => JSON.stringify(n.holes) === JSON.stringify(fluteHoles));
    if (match) {
      audioEngine.playTone(match.freq, 1.5, 'flute');
    } else {
      const closedCount = fluteHoles.reduce((a, b) => a + b, 0);
      const approxFreq = 523.25 + ((8 - closedCount) * 60); 
      audioEngine.playTone(approxFreq, 0.5, 'flute');
    }
  };

  const playGuitarChord = (frets: GuitarChord) => {
    const freqs: number[] = [];
    frets.forEach((fret, stringIdx) => {
      if (fret >= 0) {
        const baseFreq = GUITAR_TUNING[stringIdx];
        const noteFreq = baseFreq * Math.pow(2, fret / 12);
        freqs.push(noteFreq);
      }
    });
    audioEngine.playChord(freqs, 'guitar');
  };

  const renderPiano88 = () => {
    return (
      <div className="w-full relative">
        <div className="bg-slate-900 text-white p-2 rounded-t-lg flex justify-between items-center text-xs">
          <span>88 Teclas (A0 - C8)</span>
          <span className="flex items-center gap-1"><Info size={14}/> Usa la barra para desplazarte</span>
        </div>
        <div ref={pianoContainerRef} className="overflow-x-auto pb-4 pt-1 bg-slate-950 border-x-8 border-b-8 border-slate-900 rounded-b-xl shadow-2xl custom-scrollbar">
          <div className="flex relative h-[220px]" style={{ width: `${52 * 44}px` }}>
            {PIANO_KEYS.map((key) => {
              if (key.isBlack) return null;
              return (
                <button
                  key={key.id}
                  onClick={() => audioEngine.playTone(key.freq, 1.5, 'piano')}
                  className="w-[44px] h-full bg-white border border-l-0 border-slate-300 first:border-l rounded-b-md hover:bg-slate-100 active:bg-yellow-200 active:h-[215px] transition-all flex flex-col justify-end pb-2 shadow-sm relative z-10"
                >
                  {key.name.includes('C') && <span className="text-slate-400 text-[10px] font-bold">{key.name}</span>}
                </button>
              );
            })}
            <div className="absolute top-0 left-0 flex h-[140px] pointer-events-none z-20">
               {PIANO_KEYS.map((key, index) => {
                 if (!key.isBlack) return null;
                 const whiteKeysBefore = PIANO_KEYS.slice(0, index).filter(k => !k.isBlack).length;
                 const leftPos = (whiteKeysBefore * 44) - 14; 
                 return (
                   <button
                     key={key.id}
                     onClick={() => audioEngine.playTone(key.freq, 1.5, 'piano')}
                     className="absolute w-[28px] h-full bg-slate-900 border-x border-b border-black rounded-b-md shadow-xl active:bg-slate-700 pointer-events-auto hover:bg-slate-800 transition-colors"
                     style={{ left: `${leftPos}px` }}
                   />
                 );
               })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGuitarTool = () => {
    let activeFrets = customFrets;
    let activeFingers = customFingers;
    let chordInfo = null;

    if (guitarMode === 'library') {
      const chordData = CHORD_LIBRARY[selectedRoot]?.[selectedQuality];
      if (chordData) {
        activeFrets = chordData.frets;
        activeFingers = chordData.fingers || [0,0,0,0,0,0];
        chordInfo = chordData.explanation;
      } else {
        activeFrets = [-1,-1,-1,-1,-1,-1];
        chordInfo = "Acorde no disponible en la versión demo.";
      }
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-100 p-4 rounded-xl mb-6 shadow-inner border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex gap-4">
             <button onClick={() => setGuitarMode('library')} className={`px-4 py-2 rounded-lg font-bold text-sm ${guitarMode === 'library' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>Biblioteca</button>
             <button onClick={() => setGuitarMode('builder')} className={`px-4 py-2 rounded-lg font-bold text-sm ${guitarMode === 'builder' ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>Constructor</button>
          </div>

          {guitarMode === 'library' && (
            <div className="flex gap-2">
              <select value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)} className="p-2 rounded-lg border border-slate-300 font-bold text-slate-800">{ROOTS.map(r => <option key={r} value={r}>{r}</option>)}</select>
              <select value={selectedQuality} onChange={e => setSelectedQuality(e.target.value)} className="p-2 rounded-lg border border-slate-300 font-bold text-slate-800">{QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}</select>
            </div>
          )}
        </div>

        {guitarMode === 'library' && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-sm text-yellow-900 flex items-start gap-3">
            <Info className="shrink-0 mt-0.5" size={18} />
            <div><span className="font-bold block mb-1">Info:</span>{chordInfo}</div>
          </div>
        )}

        {guitarMode === 'builder' && (
           <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-sm text-blue-900 flex items-start gap-3">
             <Info className="shrink-0 mt-0.5" size={18} />
             <div>
               <span className="font-bold block mb-1">Modo Constructor:</span>
               Haz clic en el mástil para poner dedos. Haz clic en el punto naranja repetidamente para cambiar el número de dedo (1-4). Haz clic en la cejuela para cuerda al aire (0) o silenciar (X).
             </div>
           </div>
        )}

        <div className="bg-stone-900 p-6 rounded-xl shadow-2xl overflow-x-auto relative">
           <div className="min-w-[700px]">
             <div className="bg-[#EAD1B6] w-10 absolute left-6 top-6 bottom-6 z-10 border-r-4 border-stone-400 flex flex-col justify-between py-3 items-center">
                 {/* Nut Labels */}
                 {[5,4,3,2,1,0].map((s, i) => (
                    <div 
                      key={s} 
                      className={`h-4 w-6 flex items-center justify-center text-[10px] font-bold cursor-pointer rounded ${activeFrets[s] === -1 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                      onClick={() => {
                        if (guitarMode !== 'builder') return;
                        const newFrets = [...customFrets];
                        newFrets[s] = newFrets[s] === -1 ? 0 : -1;
                        setCustomFrets(newFrets);
                      }}
                    >
                      {activeFrets[s] === -1 ? 'X' : '0'}
                    </div>
                 ))}
             </div>

             <div className="relative bg-[#5D4037] h-[200px] ml-16 border-y-4 border-stone-950 flex flex-col justify-between py-3 shadow-inner">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 w-1.5 bg-stone-400 shadow-md" style={{ left: `${((i + 1) / 12) * 100}%` }}>
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-stone-500 font-mono text-xs font-bold">{i + 1}</span>
                  </div>
                ))}

                {[5, 4, 3, 2, 1, 0].map((stringIdx) => (
                   <div key={stringIdx} className="relative h-px w-full bg-stone-300 group">
                      <div className={`absolute w-full ${stringIdx < 3 ? 'h-[1px]' : 'h-[2px]'} bg-gradient-to-r from-stone-400 to-stone-200`}></div>
                      
                      {guitarMode === 'builder' && [...Array(12)].map((_, fretIdx) => (
                         <div 
                           key={fretIdx}
                           className="absolute h-8 w-[8%] -top-4 cursor-pointer z-20 opacity-0 hover:opacity-20 bg-yellow-400 rounded-full"
                           style={{ left: `${(fretIdx / 12) * 100}%`, width: `${(1/12)*100}%` }}
                           onClick={() => {
                              const newFrets = [...customFrets];
                              const newFingers = [...customFingers];
                              
                              // Logic: If clicking same fret, cycle finger. If clicking new fret, set fret and reset finger to 1
                              if (newFrets[stringIdx] === fretIdx + 1) {
                                  // Cycle fingers 1->2->3->4->1
                                  newFingers[stringIdx] = (newFingers[stringIdx] % 4) + 1;
                              } else {
                                  newFrets[stringIdx] = fretIdx + 1;
                                  newFingers[stringIdx] = 1; // Default to finger 1
                              }
                              setCustomFrets(newFrets);
                              setCustomFingers(newFingers);
                           }}
                         ></div>
                      ))}
                      
                      {activeFrets[stringIdx] > 0 && (
                        <button
                          onClick={() => {
                            if (guitarMode !== 'builder') return;
                            const newFingers = [...customFingers];
                             // Cycle fingers on click
                            newFingers[stringIdx] = (newFingers[stringIdx] % 4) + 1;
                            setCustomFingers(newFingers);
                          }}
                          className="absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg z-30 flex items-center justify-center -top-3 cursor-pointer hover:bg-orange-600"
                          style={{ left: `${((activeFrets[stringIdx] - 0.5) / 12) * 100}%` }}
                        >
                           <span className="text-[12px] font-bold text-white">
                             {activeFingers[stringIdx] > 0 ? activeFingers[stringIdx] : ''}
                           </span>
                        </button>
                      )}
                   </div>
                ))}
             </div>
           </div>
        </div>

        <div className="mt-8 flex justify-center">
           <button onClick={() => playGuitarChord(activeFrets)} className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
             <Volume2 size={24} /> Rasguear
           </button>
        </div>
      </div>
    );
  };

  const CartoonFlutist = ({ holes }: { holes: FluteFingering }) => {
    // Determine finger states (Lifted = 0 or 0.5?, Pressed = 1)
    // Actually, visual logic:
    // Holes 0-3: Left Hand. Holes 4-7: Right Hand.
    // We will simple rotate fingers if hole is open (0). 
    
    // Helper to get finger rotation
    const getFingerY = (holeIdx: number) => holes[holeIdx] > 0 ? 0 : -5; // Moves finger up if open
    
    return (
      <div className="w-[300px] h-[400px] relative">
        <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-xl">
           {/* HEAD */}
           <circle cx="100" cy="50" r="30" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2" />
           {/* Eyes */}
           <circle cx="90" cy="45" r="3" fill="#000" />
           <circle cx="110" cy="45" r="3" fill="#000" />
           {/* Smile */}
           <path d="M 90 60 Q 100 70 110 60" stroke="#000" strokeWidth="2" fill="none" />
           
           {/* BODY */}
           <path d="M 70 80 Q 100 120 130 80 L 130 180 L 70 180 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
           
           {/* FLUTE (Simplified Line) */}
           <rect x="95" y="70" width="10" height="150" fill="#a5f3fc" stroke="#22d3ee" strokeWidth="1" rx="2" />
           
           {/* LEFT HAND (Top) - Thumb(0), Index(1), Middle(2), Ring(3) */}
           {/* Arm */}
           <path d="M 70 90 Q 50 110 80 110" stroke="#fcd34d" strokeWidth="8" fill="none" strokeLinecap="round" />
           <g transform="translate(85, 100)">
              {/* Fingers overlaying flute. spacing approx 10px */}
              {/* Index (Hole 1) */}
              <rect x="0" y={10 + getFingerY(1)} width="20" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
              {/* Middle (Hole 2) */}
              <rect x="0" y={20 + getFingerY(2)} width="22" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
              {/* Ring (Hole 3) */}
              <rect x="0" y={30 + getFingerY(3)} width="20" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
           </g>

           {/* RIGHT HAND (Bottom) - Index(4), Middle(5), Ring(6), Pinky(7) */}
           {/* Arm */}
           <path d="M 130 120 Q 150 140 115 150" stroke="#fcd34d" strokeWidth="8" fill="none" strokeLinecap="round" />
           <g transform="translate(85, 140)">
              {/* Index (Hole 4) */}
              <rect x="0" y={10 + getFingerY(4)} width="20" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
              {/* Middle (Hole 5) */}
              <rect x="0" y={20 + getFingerY(5)} width="22" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
              {/* Ring (Hole 6) */}
              <rect x="0" y={30 + getFingerY(6)} width="20" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
              {/* Pinky (Hole 7) */}
              <rect x="0" y={40 + getFingerY(7)} width="18" height="6" rx="3" fill="#fcd34d" stroke="#f59e0b" />
           </g>
           
           {/* Music Notes Animation (Static for now) */}
           <text x="140" y="60" fontSize="20" fill="#ec4899">♪</text>
        </svg>
      </div>
    )
  }

  const renderFluteTool = () => {
    const holesConfig = [
      { id: 0, label: 'T', text: 'Pulgar (Atrás)' },
      { id: 1, label: '1', text: 'Índice Izq' },
      { id: 2, label: '2', text: 'Medio Izq' },
      { id: 3, label: '3', text: 'Anular Izq' },
      { id: 4, label: '4', text: 'Índice Der' },
      { id: 5, label: '5', text: 'Medio Der' },
      { id: 6, label: '6', text: 'Anular Der' },
      { id: 7, label: '7', text: 'Meñique Der' },
    ];

    const getHoleColor = (val: number) => {
      if (val === 1) return 'bg-black shadow-inner';
      if (val === 0.5) return 'bg-gradient-to-b from-black from-50% to-transparent to-50% border-2 border-black';
      return 'bg-white shadow-inner'; // CHANGED: White when open
    };

    return (
      <div className="flex flex-col xl:flex-row gap-12 items-center justify-center min-h-[600px]">
        
        {/* CARTOON */}
        <div className="hidden md:block">
           <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
             <h4 className="text-center font-bold text-slate-400 mb-4 uppercase text-xs tracking-widest">Técnica Correcta</h4>
             <CartoonFlutist holes={fluteHoles} />
             <p className="text-center text-xs text-slate-400 mt-2">Mano Izquierda Arriba / Derecha Abajo</p>
           </div>
        </div>

        {/* FLUTE VISUAL */}
        <div className="relative mx-auto select-none order-first xl:order-none">
          {/* Recorder Body: Celeste Transparent */}
          <div className="w-24 h-[680px] bg-cyan-200/80 backdrop-blur-sm rounded-full shadow-2xl border-2 border-white/50 relative flex flex-col items-center ring-4 ring-cyan-100/50">
            
            <div className="absolute top-0 w-26 h-20 bg-cyan-300/90 rounded-t-xl border-b-4 border-cyan-400/30 w-full z-10"></div>
            <div className="absolute top-8 w-12 h-8 bg-black/10 rounded-sm"></div>

            <div className="absolute top-24 w-full h-full flex flex-col items-center gap-5 pt-4">
              <div className="absolute -left-16 top-2 flex flex-col items-end gap-1">
                 <button 
                   onClick={() => toggleFluteHole(0)}
                   className={`w-10 h-10 rounded-full border-4 border-cyan-100 transition-all ${getHoleColor(fluteHoles[0])}`}
                 ></button>
                 <span className="text-xs text-cyan-600 font-bold pr-2">Pulgar</span>
              </div>

              {holesConfig.slice(1).map((hole) => (
                <div key={hole.id} className="relative group flex items-center justify-center w-full">
                  <button 
                    onClick={() => toggleFluteHole(hole.id)}
                    className={`w-12 h-12 rounded-full border-4 border-cyan-100 transition-all relative z-20 hover:scale-105 active:scale-95 ${getHoleColor(fluteHoles[hole.id])}`}
                  >
                  </button>
                  {/* Finger Visual Overlay (Tooltip) */}
                  <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-50">
                     {hole.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 w-28 h-16 bg-cyan-300/90 rounded-b-3xl border-t-4 border-cyan-400/30 w-full shadow-lg"></div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-6 max-w-sm w-full">
           <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">Flauta Dulce</h3>
              <div className="mb-4 text-center py-4 bg-cyan-50 rounded-lg">
                 <span className="text-xs font-bold text-cyan-600 uppercase">Nota Detectada</span>
                 <div className="text-5xl font-black text-cyan-600 mt-2">{fluteDetectedNote}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                 {RECORDER_NOTES.map(note => (
                   <button 
                     key={note.name}
                     onClick={() => {
                       setFluteHoles([...note.holes]);
                       setFluteDetectedNote(note.name);
                       audioEngine.playTone(note.freq, 1.0, 'flute');
                     }}
                     className="text-xs bg-slate-50 hover:bg-cyan-100 hover:text-cyan-700 p-2 rounded border transition-colors text-left"
                   >
                     {note.name.split(' ')[0]}
                   </button>
                 ))}
              </div>

              <button 
                onClick={playFluteCurrent}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
              >
                <Wind size={20} /> Soplar
              </button>
           </div>
        </div>
      </div>
    );
  };

  const renderMetallophone = () => {
    const METAL_NOTES = [
        { name: 'C5', label: 'DO', freq: 523.25 }, { name: 'D5', label: 'RE', freq: 587.33 },
        { name: 'E5', label: 'MI', freq: 659.25 }, { name: 'F5', label: 'FA', freq: 698.46 },
        { name: 'G5', label: 'SOL', freq: 783.99 }, { name: 'A5', label: 'LA', freq: 880.00 },
        { name: 'B5', label: 'SI', freq: 987.77 }, { name: 'C6', label: 'DO', freq: 1046.50 },
        { name: 'D6', label: 'RE', freq: 1174.66 }, { name: 'E6', label: 'MI', freq: 1318.51 },
        { name: 'F6', label: 'FA', freq: 1396.91 }, { name: 'G6', label: 'SOL', freq: 1567.98 },
        { name: 'A6', label: 'LA', freq: 1760.00 }, { name: 'B6', label: 'SI', freq: 1975.53 },
        { name: 'C7', label: 'DO', freq: 2093.00 },
    ];
    const METAL_ACCIDENTALS = [
        { name: 'C#5', label: 'DO#', freq: 554.37 }, { name: 'D#5', label: 'RE#', freq: 622.25 }, { spacer: true },
        { name: 'F#5', label: 'FA#', freq: 739.99 }, { name: 'G#5', label: 'SOL#', freq: 830.61 }, { name: 'A#5', label: 'LA#', freq: 932.33 }, { spacer: true },
        { name: 'C#6', label: 'DO#', freq: 1108.73 }, { name: 'D#6', label: 'RE#', freq: 1244.51 }, { spacer: true },
        { name: 'F#6', label: 'FA#', freq: 1479.98 }, { name: 'G#6', label: 'SOL#', freq: 1661.22 }, { name: 'A#6', label: 'LA#', freq: 1864.66 },
    ];
    const getColor = (label: string) => {
        if (label.includes('DO')) return 'from-red-500 to-red-600 text-white';
        if (label.includes('RE')) return 'from-orange-400 to-orange-500 text-white';
        if (label.includes('MI')) return 'from-yellow-300 to-yellow-400 text-black';
        if (label.includes('FA')) return 'from-green-400 to-green-500 text-white';
        if (label.includes('SOL')) return 'from-cyan-400 to-cyan-500 text-white';
        if (label.includes('LA')) return 'from-slate-100 to-white text-black';
        if (label.includes('SI')) return 'from-purple-500 to-purple-600 text-white';
        return 'from-slate-800 to-black text-white';
    };

    return (
      <div className="relative bg-yellow-400 p-4 md:p-8 rounded-xl shadow-2xl border-b-[12px] border-yellow-600 w-full max-w-[1200px] mx-auto overflow-x-auto flex flex-col items-center select-none">
        <div className="bg-yellow-500/30 rounded-lg p-4 min-w-[800px] relative w-full">
           <div className="absolute top-[28%] left-4 right-4 h-3 bg-black/20 rounded-full blur-sm z-0"></div>
           <div className="absolute bottom-[18%] left-4 right-4 h-3 bg-black/20 rounded-full blur-sm z-0"></div>
           <div className="flex justify-start pl-[50px] mb-[-30px] relative z-20 gap-[28px]">
             {METAL_ACCIDENTALS.map((note, i) => (
                note.spacer ? <div key={i} className="w-[50px]"></div> :
                <button key={i} onClick={() => audioEngine.playTone(note.freq!, 0.8, 'profelofono')} className="w-[50px] h-[150px] rounded-b-md rounded-t-sm shadow-xl flex flex-col items-center justify-between py-2 border-b-4 border-black/40 bg-gradient-to-b from-slate-800 to-black text-white hover:-translate-y-1 transition-transform">
                     <div className="w-3 h-3 rounded-full bg-zinc-400 flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-600 rotate-45"></div></div>
                     <span className="font-bold">{note.label}</span>
                     <div className="w-3 h-3 rounded-full bg-zinc-400 flex items-center justify-center"><div className="w-full h-[1px] bg-zinc-600 rotate-45"></div></div>
                </button>
             ))}
           </div>
           <div className="flex justify-between gap-2 relative z-10 pt-4">
             {METAL_NOTES.map((note, i) => (
               <button key={i} onClick={() => audioEngine.playTone(note.freq, 0.8, 'profelofono')} className={`flex-1 min-w-[50px] rounded-md shadow-md flex flex-col items-center justify-between py-3 border-b-4 border-black/20 bg-gradient-to-b ${getColor(note.label)} hover:-translate-y-1 transition-transform`} style={{ height: `${280 - i * 8}px` }}>
                 <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center"><div className="w-2/3 h-[1px] bg-slate-500"></div></div>
                 <div className="text-center">
                    <span className="text-3xl font-black opacity-90 block">{note.name.replace(/\d/,'')}</span>
                    <span className="text-sm font-bold opacity-75">{note.label}</span>
                 </div>
                 <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center"><div className="w-2/3 h-[1px] bg-slate-500"></div></div>
               </button>
             ))}
           </div>
        </div>
      </div>
    );
  };

  const InstrumentSelector = () => (
    <div className="flex flex-wrap justify-center gap-2 mb-8 bg-slate-200/50 p-2 rounded-xl inline-flex mx-auto border border-slate-200">
      <button onClick={() => setInstrument('profelofono')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'profelofono' ? 'bg-yellow-400 text-yellow-900 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}><Grid size={18} /> Metalófono</button>
      <button onClick={() => setInstrument('piano')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'piano' ? 'bg-white text-slate-900 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}><Music size={18} /> Piano</button>
      <button onClick={() => setInstrument('guitar')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'guitar' ? 'bg-orange-700 text-white shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}><Guitar size={18} /> Guitarra</button>
      <button onClick={() => setInstrument('flute')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${instrument === 'flute' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}><Wind size={18} /> Flauta</button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-8 px-2 min-h-[700px] select-none w-full">
      <h2 className="text-4xl font-bold mb-2 text-slate-800 drop-shadow-sm">Instrumentos Virtuales</h2>
      <p className="text-slate-500 mb-6 text-center max-w-2xl">
        Herramientas interactivas para el aprendizaje musical.
      </p>

      <InstrumentSelector />

      <div className="w-full transition-all duration-300">
        {instrument === 'profelofono' && renderMetallophone()}
        {instrument === 'piano' && renderPiano88()}
        {instrument === 'guitar' && renderGuitarTool()}
        {instrument === 'flute' && renderFluteTool()}
      </div>
    </div>
  );
};

export default Profelofono;