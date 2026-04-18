export default function OurSpaceLoader(): React.JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <style>
        {`
                .klock-draw {
                    stroke-dasharray: 100;
                    stroke-dashoffset: 100;
                    animation: drawK 2.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                }

                @keyframes drawK {
                    0% { stroke-dashoffset: 100; opacity: 0; }
                    30% { opacity: 1; }
                    70% { stroke-dashoffset: 0; opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                }
                `}
      </style>

      <div className="w-24 h-24 mb-6">
        <svg viewBox="0 0 100 100">
          {/* Vertical Pillar */}
          <polyline
            points="38,28 38,72"
            fill="none"
            stroke="#FF8A00"
            strokeWidth="8"
            strokeLinecap="round"
            className="klock-draw"
            style={{ animationDelay: '0s' }}
          />
          {/* Top Branch */}
          <polyline
            points="38,50 62,28"
            fill="none"
            stroke="#7B61FF"
            strokeWidth="8"
            strokeLinecap="round"
            className="klock-draw"
            style={{ animationDelay: '0.2s' }}
          />
          {/* Bottom Branch */}
          <polyline
            points="38,50 62,72"
            fill="none"
            stroke="#1DBF73"
            strokeWidth="8"
            strokeLinecap="round"
            className="klock-draw"
            style={{ animationDelay: '0.4s' }}
          />
        </svg>
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">OurSpace</p>
    </div>
  )
}
