import React, { useState } from 'react';
import { KeySignature } from '../../types';

// Updated Data with Colors and Explicit Enharmonics
interface EnhancedKeySignature extends KeySignature {
  fillColor: string;
}

const KEYS: EnhancedKeySignature[] = [
  { key: 'Do', relativeMinor: 'La m', accidentals: '0', notes: ['Do','Re','Mi','Fa','Sol','La','Si'], fillColor: '#ef4444' }, // Red
  { key: 'Sol', relativeMinor: 'Mi m', accidentals: '1#', notes: ['Sol','La','Si','Do','Re','Mi','Fa#'], fillColor: '#f97316' }, // Orange
  { key: 'Re', relativeMinor: 'Si m', accidentals: '2#', notes: ['Re','Mi','Fa#','Sol','La','Si','Do#'], fillColor: '#f59e0b' }, // Amber
  { key: 'La', relativeMinor: 'Fa# m', accidentals: '3#', notes: ['La','Si','Do#','Re','Mi','Fa#','Sol#'], fillColor: '#eab308' }, // Yellow
  { key: 'Mi', relativeMinor: 'Do# m', accidentals: '4#', notes: ['Mi','Fa#','Sol#','La','Si','Do#','Re#'], fillColor: '#84cc16' }, // Lime
  // B Major / Cb Major
  { key: 'Si / Do b', relativeMinor: 'Sol# m / Lab m', accidentals: '5# / 7b', notes: ['Si','Do#','Re#','Mi','Fa#','Sol#','La#'], fillColor: '#22c55e' }, // Green
  // F# Major / Gb Major
  { key: 'Fa# / Sol b', relativeMinor: 'Re# m / Mib m', accidentals: '6# / 6b', notes: ['Fa#','Sol#','La#','Si','Do#','Re#','Mi#'], fillColor: '#06b6d4' }, // Cyan
  // C# Major / Db Major
  { key: 'Do# / Re b', relativeMinor: 'La# m / Sib m', accidentals: '7# / 5b', notes: ['Do#','Re#','Mi#','Fa#','Sol#','La#','Si#'], fillColor: '#3b82f6' }, // Blue
  { key: 'La b', relativeMinor: 'Fa m', accidentals: '4b', notes: ['Lab','Sib','Do','Reb','Mib','Fa','Sol'], fillColor: '#6366f1' }, // Indigo
  { key: 'Mi b', relativeMinor: 'Do m', accidentals: '3b', notes: ['Mib','Fa','Sol','Lab','Sib','Do','Re'], fillColor: '#8b5cf6' }, // Violet
  { key: 'Si b', relativeMinor: 'Sol m', accidentals: '2b', notes: ['Sib','Do','Re','Mib','Fa','Sol','La'], fillColor: '#d946ef' }, // Fuchsia
  { key: 'Fa', relativeMinor: 'Re m', accidentals: '1b', notes: ['Fa','Sol','La','Sib','Do','Re','Mi'], fillColor: '#ec4899' }, // Pink
];

const CircleOfFifths: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<EnhancedKeySignature>(KEYS[0]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Helper to calculate Minor Scale (Natural Minor = Major Scale starting from 6th degree)
  // Major: 1 2 3 4 5 6 7
  // Minor: 6 7 1 2 3 4 5
  const getMinorScale = (notes: string[]) => {
    return [...notes.slice(5), ...notes.slice(0, 5)];
  };

  const minorScaleNotes = getMinorScale(selectedKey.notes);

  // SVG Calculation helpers - INCREASED SIZES
  const centerX = 350; // Centered in new 700x700 viewBox
  const centerY = 350;
  const totalSlices = 12;
  
  // Dimensions for rings - INCREASED
  const outerRadius = 280; // Bigger
  const midRadius = 185;
  const innerRadius = 105;

  const createRingSlice = (
    index: number, 
    label: string, 
    color: string, 
    rOut: number, 
    rIn: number, 
    isSelected: boolean,
    ringType: 'major' | 'minor'
  ) => {
    // Geometry calculation
    const startAngle = (index * 360) / totalSlices - 90 - 15; // -15 to center top slice
    const endAngle = startAngle + 30;

    const x1 = centerX + rOut * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + rOut * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + rOut * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + rOut * Math.sin((endAngle * Math.PI) / 180);

    const x3 = centerX + rIn * Math.cos((endAngle * Math.PI) / 180);
    const y3 = centerY + rIn * Math.sin((endAngle * Math.PI) / 180);
    const x4 = centerX + rIn * Math.cos((startAngle * Math.PI) / 180);
    const y4 = centerY + rIn * Math.sin((startAngle * Math.PI) / 180);

    const pathData = `
      M ${x1} ${y1}
      A ${rOut} ${rOut} 0 0 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rIn} ${rIn} 0 0 0 ${x4} ${y4}
      Z
    `;

    // Text Position (Middle of the slice)
    const midAngle = startAngle + 15;
    const textRadius = (rOut + rIn) / 2;
    const tx = centerX + textRadius * Math.cos((midAngle * Math.PI) / 180);
    const ty = centerY + textRadius * Math.sin((midAngle * Math.PI) / 180);

    // Handle splitting text for complex keys like "Si / Do b"
    const lines = label.split('/');

    // Determine scale transformation for hover
    // We use transform origin center to make them pop out
    const isHovered = hoveredIndex === index;
    const scale = isSelected ? 1.05 : isHovered ? 1.05 : 1;
    const opacity = isSelected ? 1 : isHovered ? 0.9 : 0.85;

    return (
      <g 
        key={label + index + ringType} 
        onClick={() => setSelectedKey(KEYS[index])}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        className="cursor-pointer"
        style={{ 
          transformOrigin: `${centerX}px ${centerY}px`,
          transform: `scale(${scale})`,
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s'
        }}
      >
        <path 
          d={pathData} 
          fill={color}
          stroke="white"
          strokeWidth="2"
          style={{ opacity: opacity }}
        />
        
        {/* Render text lines vertically centered */}
        {lines.length === 1 ? (
          <text 
            x={tx} 
            y={ty} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="white"
            className={`font-black pointer-events-none select-none drop-shadow-md ${ringType === 'major' ? 'text-xl' : 'text-base'}`}
          >
            {lines[0].trim()}
          </text>
        ) : (
          <>
            <text 
              x={tx} 
              y={ty - 8} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="white"
              className={`font-bold pointer-events-none select-none drop-shadow-md ${ringType === 'major' ? 'text-base' : 'text-xs'}`}
            >
              {lines[0].trim()}
            </text>
            <line x1={tx-10} y1={ty} x2={tx+10} y2={ty} stroke="white" strokeWidth="1" opacity="0.5" />
            <text 
              x={tx} 
              y={ty + 10} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="white"
              className={`font-bold pointer-events-none select-none drop-shadow-md ${ringType === 'major' ? 'text-base' : 'text-xs'}`}
            >
              {lines[1].trim()}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-12 p-8 bg-white rounded-xl shadow-lg border border-slate-200">
      
      <div className="flex flex-col items-center relative w-full xl:w-auto">
        <h2 className="text-3xl font-bold mb-2 text-slate-800">Círculo de Quintas</h2>
        <p className="text-slate-400 mb-6 text-sm">Pasa el cursor para animar, click para seleccionar</p>
        
        {/* Increased viewBox to accommodate larger circle */}
        <svg width="100%" height="auto" viewBox="0 0 700 700" className="drop-shadow-2xl max-w-[600px] xl:max-w-[700px] h-auto">
          {KEYS.map((k, i) => {
            const isSelected = selectedKey.key === k.key;
            return (
              <React.Fragment key={i}>
                {/* Outer Ring - Major Keys */}
                {createRingSlice(i, k.key, k.fillColor, outerRadius, midRadius, isSelected, 'major')}
                
                {/* Inner Ring - Minor Keys */}
                {/* We use the same color but it's separated by the stroke */}
                {createRingSlice(i, k.relativeMinor, k.fillColor, midRadius, innerRadius, isSelected, 'minor')}
              </React.Fragment>
            );
          })}
          
          {/* Inner Circle Background */}
          <circle cx={centerX} cy={centerY} r={innerRadius - 2} fill="white" />
          
          {/* Center Info Display */}
          <foreignObject x={centerX - 80} y={centerY - 80} width="160" height="160">
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
              <span className="text-xs font-bold text-slate-400 uppercase">Selección</span>
              <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">
                {selectedKey.key.split('/')[0]}
              </h3>
               <span className="text-xs text-slate-400">Mayor</span>
              
              <div className="w-8 h-[1px] bg-slate-200 my-2"></div>
              
              <h4 className="text-xl font-bold text-slate-600 leading-tight mb-1">
                {selectedKey.relativeMinor.split('/')[0]}
              </h4>
               <span className="text-xs text-slate-400">Menor</span>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Explanation Panel */}
      <div className="flex flex-col gap-6 w-full max-w-lg">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
          {/* Colored header bar */}
          <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: selectedKey.fillColor }}></div>
          
          <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tonalidad</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black text-slate-800">{selectedKey.key}</h3>
                   <span className="text-lg text-slate-500 font-medium">Mayor</span>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Alteraciones</p>
                <span className="text-2xl font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                  {selectedKey.accidentals}
                </span>
             </div>
          </div>
          
          <div className="space-y-6">
            
            {/* Major Scale Section */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Escala Mayor</span>
              <div className="flex flex-wrap gap-2">
                {selectedKey.notes.map((n, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="w-10 h-10 flex items-center justify-center bg-white border-2 border-slate-200 rounded-lg text-slate-800 font-bold text-sm shadow-sm">
                      {n}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Minor Scale Section (Reflected) */}
            <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Escala Menor Natural</span>
                  <span className="text-sm font-bold text-slate-700">{selectedKey.relativeMinor}</span>
               </div>
              <div className="flex flex-wrap gap-2">
                {minorScaleNotes.map((n, i) => (
                  <div key={`m-${i}`} className="flex flex-col items-center">
                    <span className="w-9 h-9 flex items-center justify-center bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-bold text-xs shadow-sm">
                      {n}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chords Grid - MAJOR */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
               <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3">Grados y Acordes (Escala Mayor)</span>
               <div className="grid grid-cols-4 gap-3">
                  <div className="text-center col-span-4 grid grid-cols-7 gap-1">
                      {/* I */}
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">I</span>
                          <div className="bg-blue-500 text-white rounded py-1 text-xs font-bold shadow-sm">{selectedKey.notes[0]}</div>
                      </div>
                       {/* ii */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">ii</span>
                          <div className="bg-white border text-slate-600 rounded py-1 text-xs">{selectedKey.notes[1]}m</div>
                      </div>
                       {/* iii */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">iii</span>
                          <div className="bg-white border text-slate-600 rounded py-1 text-xs">{selectedKey.notes[2]}m</div>
                      </div>
                       {/* IV */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">IV</span>
                          <div className="bg-blue-400 text-white rounded py-1 text-xs font-bold shadow-sm">{selectedKey.notes[3]}</div>
                      </div>
                       {/* V */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">V</span>
                          <div className="bg-blue-600 text-white rounded py-1 text-xs font-bold shadow-sm">{selectedKey.notes[4]}</div>
                      </div>
                       {/* vi */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-red-500 font-bold">vi</span>
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded py-1 text-xs font-bold">{selectedKey.notes[5]}m</div>
                      </div>
                       {/* vii */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">vii°</span>
                          <div className="bg-slate-100 text-slate-400 rounded py-1 text-xs border">{selectedKey.notes[6]}°</div>
                      </div>
                  </div>
               </div>
            </div>

            {/* Chords Grid - MINOR (Added) */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Grados y Acordes (Escala Menor)</span>
               <div className="grid grid-cols-4 gap-3">
                  <div className="text-center col-span-4 grid grid-cols-7 gap-1">
                      {/* i */}
                      <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-red-700 font-bold">i</span>
                          <div className="bg-red-50 border border-red-200 text-red-700 rounded py-1 text-xs font-bold">{minorScaleNotes[0]}m</div>
                      </div>
                       {/* ii° */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">ii°</span>
                          <div className="bg-white border text-slate-400 rounded py-1 text-xs">{minorScaleNotes[1]}°</div>
                      </div>
                       {/* III */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">III</span>
                          <div className="bg-blue-500 text-white rounded py-1 text-xs font-bold shadow-sm">{minorScaleNotes[2]}</div>
                      </div>
                       {/* iv */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">iv</span>
                          <div className="bg-white border text-slate-600 rounded py-1 text-xs">{minorScaleNotes[3]}m</div>
                      </div>
                       {/* v */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold">v</span>
                          <div className="bg-white border text-slate-600 rounded py-1 text-xs">{minorScaleNotes[4]}m</div>
                      </div>
                       {/* VI */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">VI</span>
                          <div className="bg-blue-400 text-white rounded py-1 text-xs font-bold shadow-sm">{minorScaleNotes[5]}</div>
                      </div>
                       {/* VII */}
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-blue-800 font-bold">VII</span>
                          <div className="bg-blue-600 text-white rounded py-1 text-xs font-bold shadow-sm">{minorScaleNotes[6]}</div>
                      </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default CircleOfFifths;