
import React, { useState } from 'react';
import { HeroCard } from '../types';

interface HeroGalleryProps {
  heroes: HeroCard[];
}

const HeroGallery: React.FC<HeroGalleryProps> = ({ heroes }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedHero, setSelectedHero] = useState<HeroCard | null>(null);

  const getRarityStyles = (rarity: HeroCard['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return {
          dot: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse',
          bar: 'bg-gradient-to-b from-red-600 via-rose-500 to-red-600 shadow-[0_0_25px_rgba(239,68,68,0.8)]',
          badge: 'bg-red-600 text-white animate-pulse',
          text: 'text-rose-400'
        };
      case 'Legendary':
        return {
          dot: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]',
          bar: 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
          badge: 'bg-amber-500 text-slate-950',
          text: 'text-amber-300'
        };
      case 'Epic':
        return {
          dot: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
          bar: 'bg-purple-600',
          badge: 'bg-purple-600 text-white',
          text: 'text-purple-300'
        };
      case 'Rare':
        return {
          dot: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
          bar: 'bg-indigo-500',
          badge: 'bg-indigo-600 text-white',
          text: 'text-indigo-300'
        };
      default:
        return {
          dot: 'bg-slate-600',
          bar: 'bg-slate-700',
          badge: 'bg-slate-700 text-slate-300',
          text: 'text-slate-100'
        };
    }
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-6 h-full flex flex-col min-h-[450px] shadow-2xl relative overflow-visible">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-5">
        <div className="flex flex-col">
          <h3 className="text-2xl font-black text-indigo-400 uppercase tracking-tighter italic">מרכז לוגיסטי</h3>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">מלאי גיבורי-על פעיל</span>
        </div>
        <div className="bg-slate-950 ring-1 ring-slate-800 px-5 py-2 rounded-xl text-sm font-black text-white shadow-inner">
          {heroes.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 space-y-4 overflow-x-visible">
        {heroes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-24">
            <div className="text-8xl mb-6">🔩</div>
            <p className="text-sm font-black text-center px-8 text-slate-400 uppercase tracking-widest leading-relaxed">המחסן ממתין לגיוס ראשון</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 pb-4 overflow-visible">
            {[...heroes].reverse().map((hero, idx) => {
              const styles = getRarityStyles(hero.rarity);
              return (
                <div 
                  key={`${hero.id}-${idx}`} 
                  onMouseEnter={() => setHoveredId(`${hero.id}-${idx}`)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedHero(hero)}
                  className="group relative flex items-center gap-4 bg-slate-950/40 hover:bg-slate-800/60 p-4 rounded-2xl border border-slate-800 transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer animate-hero-entry overflow-visible"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-slate-800 group-hover:border-indigo-500/50 transition-all duration-500 shadow-lg relative">
                    <img src={hero.imageUrl} alt={hero.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors"></div>
                  </div>
                  
                  <div className="flex flex-col min-w-0 pr-1">
                    <h4 className={`font-black text-sm truncate leading-none transition-colors ${styles.text}`}>{hero.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
                      <p className="text-[9px] text-slate-500 truncate uppercase font-black tracking-widest">{hero.rarity}</p>
                    </div>
                  </div>

                  <div className={`absolute top-0 right-0 w-1.5 h-full ${styles.bar}`}></div>
                  
                  {/* Tooltip */}
                  {hoveredId === `${hero.id}-${idx}` && (
                    <div className="absolute z-[100] left-full ml-4 top-1/2 -translate-y-1/2 w-48 p-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in pointer-events-none hidden lg:block">
                      <h5 className={`font-black text-xs uppercase mb-1 ${styles.text}`}>{hero.name}</h5>
                      <p className="text-[10px] text-slate-300 font-bold leading-relaxed">{hero.power}</p>
                      <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-[8px] border-transparent border-r-slate-700"></div>
                    </div>
                  )}

                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hero Preview Modal */}
      {selectedHero && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedHero(null)}
        >
          <div 
            className="bg-slate-900 border-2 border-slate-700 p-6 rounded-[2.5rem] max-w-sm w-full shadow-2xl transform scale-in-center overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/5] shadow-inner group">
              <img src={selectedHero.imageUrl} alt={selectedHero.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedHero(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center px-2">
              <div className="flex justify-center mb-3">
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${getRarityStyles(selectedHero.rarity).badge}`}>
                   {selectedHero.rarity}
                 </span>
              </div>
              <h3 className={`text-2xl font-black mb-2 uppercase italic ${getRarityStyles(selectedHero.rarity).text}`}>{selectedHero.name}</h3>
              <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">{selectedHero.power}</p>
              <div className="h-px w-full bg-slate-800 mb-4"></div>
              <p className="text-slate-400 text-sm leading-relaxed italic">"{selectedHero.description}"</p>
              
              <button 
                onClick={() => setSelectedHero(null)}
                className="mt-8 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all uppercase tracking-widest text-sm"
              >
                סגור תצוגה
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
        @keyframes hero-entry {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-hero-entry {
          animation: hero-entry 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes scale-in-center {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-in-center {
          animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
      `}</style>
    </div>
  );
};

export default HeroGallery;
