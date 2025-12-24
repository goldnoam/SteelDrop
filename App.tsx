
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeroCard, Slot, RewardType, GameState } from './types';
import { getLocalHeroCard } from './services/heroService';
import { sounds } from './services/audioService';
import HeroGallery from './components/HeroGallery';
import GameBoard from './components/GameBoard';

const INITIAL_COINS = 20;
const STORAGE_KEY = 'super_hero_coin_drop_v6';

const SLOTS: Slot[] = [
  { id: 0, type: 'EMPTY', label: 'מחסן ריק', color: 'bg-slate-700' },
  { id: 1, type: 'COINS', label: '+5 מטבעות', color: 'bg-amber-600' },
  { id: 2, type: 'HERO', label: 'גיוס גיבור!', color: 'bg-indigo-600' },
  { id: 3, type: 'EMPTY', label: 'מחסן ריק', color: 'bg-slate-700' },
  { id: 4, type: 'COINS', label: '+10 מטבעות', color: 'bg-amber-700' },
  { id: 5, type: 'HERO', label: 'גיוס גיבור!', color: 'bg-indigo-700' },
  { id: 6, type: 'EMPTY', label: 'מחסן ריק', color: 'bg-slate-700' },
];

interface CurrentWin {
  type: RewardType;
  hero: HeroCard | null;
  coins: number;
  isLucky: boolean;
  streakBonus: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isDropping: false, streak: parsed.streak || 0 };
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return {
      coins: INITIAL_COINS,
      collection: [],
      isDropping: false,
      lastReward: null,
      streak: 0
    };
  });
  
  const [displayCoins, setDisplayCoins] = useState(gameState.coins);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentWin, setCurrentWin] = useState<CurrentWin | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLuckyNext, setIsLuckyNext] = useState(false);

  // Animated Coin Counter effect
  useEffect(() => {
    if (displayCoins !== gameState.coins) {
      const timeout = setTimeout(() => {
        const diff = gameState.coins - displayCoins;
        const step = diff > 0 ? 1 : -1;
        setDisplayCoins(prev => prev + step);
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [gameState.coins, displayCoins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const dropCoin = useCallback(async () => {
    if (gameState.coins <= 0 || gameState.isDropping) return;

    // Check for Lucky Drop (7% chance)
    const luckyRoll = Math.random() < 0.07;
    setIsLuckyNext(luckyRoll);

    sounds.drop();
    setGameState(prev => ({ 
      ...prev, 
      coins: prev.coins - 1, 
      isDropping: true,
      lastReward: null 
    }));
    
    const randomIdx = Math.floor(Math.random() * SLOTS.length);
    setTargetSlot(randomIdx);

    setTimeout(async () => {
      handleLanding(randomIdx, luckyRoll);
    }, 3000);
  }, [gameState.coins, gameState.isDropping]);

  const handleLanding = async (slotIdx: number, isLucky: boolean) => {
    let slot = SLOTS[slotIdx];
    setTargetSlot(null);

    // If it was a lucky drop, we force a win if it was empty
    if (isLucky && slot.type === 'EMPTY') {
      slot = SLOTS[Math.random() < 0.5 ? 2 : 4]; // Force hero or high coins
    }

    let hero: HeroCard | null = null;
    let coinBonus = 0;
    let streakBonus = 0;

    if (slot.type !== 'EMPTY') {
      // Build streak
      const newStreak = gameState.streak + 1;
      if (newStreak >= 3) streakBonus = 2; // +2 coin efficiency bonus for streaks

      if (slot.type === 'HERO') {
        setIsGenerating(true);
        setShowRewardModal(true);
        setCurrentWin(null); 
        
        hero = await getLocalHeroCard();
        // Lucky hero is guaranteed Mythic or Legendary
        if (isLucky && hero) {
          hero.rarity = Math.random() > 0.5 ? 'Mythic' : 'Legendary';
          hero.name = "✨ " + hero.name;
        }

        const winData: CurrentWin = { type: 'HERO', hero, coins: streakBonus, isLucky, streakBonus };
        setCurrentWin(winData);
        setGameState(prev => ({
          ...prev,
          isDropping: false,
          lastReward: 'HERO',
          streak: newStreak,
          coins: prev.coins + streakBonus,
          collection: [...prev.collection, hero!]
        }));
        sounds.winHero();
        setIsGenerating(false);
      } else {
        coinBonus = slot.id === 4 ? 10 : 5;
        if (isLucky) coinBonus += 40; // Mega lucky bonus

        const totalCoins = coinBonus + streakBonus;
        const winData: CurrentWin = { type: 'COINS', hero: null, coins: totalCoins, isLucky, streakBonus };
        
        setCurrentWin(winData);
        setGameState(prev => ({
          ...prev,
          isDropping: false,
          lastReward: 'COINS',
          streak: newStreak,
          coins: prev.coins + totalCoins
        }));
        sounds.winCoin();
        setShowRewardModal(true);
      }
    } else {
      // Break streak
      setCurrentWin({ type: 'EMPTY', hero: null, coins: 0, isLucky: false, streakBonus: 0 });
      setGameState(prev => ({ ...prev, isDropping: false, lastReward: 'EMPTY', streak: 0 }));
      sounds.miss();
      setShowRewardModal(true);
    }
  };

  const getRarityClass = (rarity?: string) => {
    switch (rarity) {
      case 'Mythic': return 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse ring-2 ring-white/20';
      case 'Legendary': return 'bg-amber-500 text-slate-950 animate-pulse';
      case 'Epic': return 'bg-purple-600 text-white shadow-lg shadow-purple-500/20';
      case 'Rare': return 'bg-indigo-600 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getHeroNameClass = (rarity?: string) => {
    switch (rarity) {
      case 'Mythic': return 'text-rose-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]';
      case 'Legendary': return 'text-amber-300';
      case 'Epic': return 'text-purple-300';
      case 'Rare': return 'text-indigo-300';
      default: return 'text-white';
    }
  };

  const resetGame = () => {
    if (confirm("האם ברצונך לאפס את כל המחסן והזכויות שצברת?")) {
      setGameState({
        coins: INITIAL_COINS,
        collection: [],
        isDropping: false,
        lastReward: null,
        streak: 0
      });
      localStorage.removeItem(STORAGE_KEY);
      setCurrentWin(null);
      setDisplayCoins(INITIAL_COINS);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 select-none text-slate-100">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-cyan-400 to-emerald-400 uppercase tracking-tighter italic">
            STEEL DROP
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">מערכת ניהול מחסן גיבורים</p>
            {gameState.streak > 0 && (
              <span className="bg-indigo-500 text-[8px] font-black px-1.5 py-0.5 rounded animate-pulse">
                STREAK: {gameState.streak}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">מטבעות ברשותך</span>
            <span className={`text-3xl font-black transition-colors duration-300 ${displayCoins > gameState.coins ? 'text-red-400' : displayCoins < gameState.coins ? 'text-emerald-400' : 'text-amber-400'} drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]`}>
              {displayCoins}
            </span>
          </div>
          <div className="h-12 w-[2px] bg-slate-800 rounded-full"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">מלאי במחסן</span>
            <span className="text-3xl font-black text-indigo-400 drop-shadow-[0_0_15_rgba(129,140,248,0.4)]">
              {gameState.collection.length}
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <aside className="lg:col-span-4 order-2 lg:order-1 flex flex-col gap-4">
          <HeroGallery heroes={gameState.collection} />
          
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-3">
             {gameState.streak >= 3 && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl mb-2 flex items-center gap-3">
                  <div className="text-xl">🚀</div>
                  <div>
                    <p className="font-black text-indigo-300 uppercase tracking-tighter">בונוס יעילות מחסן!</p>
                    <p className="text-[9px] opacity-70 italic">+2 מטבעות על כל זכייה</p>
                  </div>
                </div>
              )}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-black text-slate-200">סטטוס מחסן:</span>
              <span className="text-emerald-400 animate-pulse font-bold uppercase tracking-widest">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold">
              <div className="bg-slate-800/50 p-2 rounded">רצף זכיות: {gameState.streak}</div>
              <div className="bg-slate-800/50 p-2 rounded">מטבעות: {gameState.coins}</div>
            </div>
            <button 
              onClick={resetGame}
              className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-500 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest"
            >
              מחיקה מוחלטת של המחסן
            </button>
          </div>
        </aside>

        <section className="lg:col-span-8 order-1 lg:order-2 flex flex-col items-center gap-8">
          <div className={`relative w-full aspect-[4/5] md:aspect-[3/4] max-w-lg bg-slate-950 rounded-[2.5rem] border-[12px] transition-colors duration-1000 ${isLuckyNext ? 'border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.4)]' : 'border-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.8)]'} overflow-hidden`}>
            {isLuckyNext && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[40] bg-amber-500 text-slate-950 px-6 py-1 rounded-full font-black text-xs uppercase tracking-widest animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.8)]">
                ✨ LUCKY DROP ACTIVE ✨
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none z-10"></div>
            <GameBoard isDropping={gameState.isDropping} targetSlotIndex={targetSlot} slots={SLOTS} />
          </div>

          <div className="w-full max-w-lg">
            <button
              onClick={dropCoin}
              disabled={gameState.isDropping || gameState.coins <= 0}
              className={`
                w-full py-8 rounded-3xl text-3xl font-black uppercase tracking-widest transition-all duration-500 transform
                ${gameState.isDropping || gameState.coins <= 0
                  ? 'bg-slate-800/50 text-slate-700 cursor-not-allowed scale-95 opacity-50'
                  : 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-900 shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-[1.03] active:scale-95 hover:shadow-amber-500/40 ring-4 ring-amber-500/20'}
              `}
            >
              {gameState.isDropping ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  מעבד...
                </span>
              ) : gameState.coins <= 0 ? 'המחסן ריק' : 'הטלת מטבע'}
            </button>
            <p className="text-center mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">כל הטלה עולה 1 מטבע מהמלאי</p>
          </div>
        </section>
      </main>

      {showRewardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className={`bg-slate-900 border-2 ${currentWin?.isLucky ? 'border-amber-500 shadow-[0_0_100px_rgba(245,158,11,0.5)]' : 'border-slate-700 shadow-[0_0_100px_rgba(0,0,0,1)]'} p-10 rounded-[3rem] max-w-md w-full text-center relative overflow-hidden transform scale-in-center`}>
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center">
                <div className="w-24 h-24 border-[6px] border-indigo-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(99,102,241,0.4)]"></div>
                <h3 className="text-2xl font-black text-indigo-400 animate-pulse">גיבור בדרך למחסן...</h3>
                <p className="text-slate-500 mt-3 text-sm font-bold uppercase tracking-tighter">רישום זכויות דיגיטליות</p>
              </div>
            ) : (
              <>
                <div className={`absolute -top-10 -left-10 w-40 h-40 ${currentWin?.isLucky ? 'bg-amber-500/20' : 'bg-indigo-500/10'} rounded-full blur-3xl`}></div>
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${currentWin?.isLucky ? 'bg-amber-500/20' : 'bg-indigo-500/10'} rounded-full blur-3xl`}></div>
                
                {currentWin?.isLucky && (
                   <div className="absolute top-4 left-0 right-0 overflow-hidden pointer-events-none h-24">
                      <div className="flex justify-around animate-bounce">
                        {[...Array(10)].map((_, i) => <span key={i} className="text-amber-500 opacity-50">✨</span>)}
                      </div>
                   </div>
                )}

                <h2 className={`text-5xl font-black mb-4 uppercase tracking-tighter italic ${currentWin?.isLucky ? 'text-amber-400' : 'text-white'}`}>
                  {currentWin?.isLucky ? 'מזל אדיר!' : 
                   currentWin?.type === 'HERO' ? 'גיוס מוצלח!' : 
                   currentWin?.type === 'COINS' ? 'בונוס מלאי!' : 'הטלה ריקה'}
                </h2>

                {gameState.streak >= 2 && currentWin?.type !== 'EMPTY' && (
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 animate-pulse">
                    רצף של {gameState.streak} זכיות!
                  </div>
                )}
                
                {currentWin?.type === 'HERO' && currentWin.hero && (
                  <div className="mb-8 group cursor-default">
                    <div className={`relative rounded-3xl overflow-hidden bg-slate-800 p-3 shadow-2xl ring-4 ${currentWin.isLucky ? 'ring-amber-500 shadow-amber-500/20' : 'ring-indigo-500/30'} transition-all`}>
                      <img src={currentWin.hero.imageUrl} alt={currentWin.hero.name} className="w-full aspect-[4/5] object-cover rounded-2xl mb-4" />
                      <h3 className={`text-3xl font-black leading-none mb-2 ${getHeroNameClass(currentWin.hero.rarity)}`}>{currentWin.hero.name}</h3>
                      <p className="text-sm text-slate-400 mt-2 px-4 italic leading-relaxed">"{currentWin.hero.description}"</p>
                      
                      <div className="flex justify-between items-center px-6 py-4 mt-4 bg-slate-950/50 rounded-2xl">
                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{currentWin.hero.power}</span>
                        <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-black uppercase shadow-lg ${getRarityClass(currentWin.hero.rarity)}`}>
                          {currentWin.hero.rarity}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentWin?.type === 'COINS' && (
                  <div className="mb-10 py-12 flex flex-col items-center">
                    <div className={`text-9xl mb-6 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] ${currentWin.isLucky ? 'animate-bounce' : 'animate-bounce-gentle'}`}>
                      {currentWin.isLucky ? '🏆' : '💰'}
                    </div>
                    <p className={`text-4xl font-black ${currentWin.isLucky ? 'text-amber-400' : 'text-white'}`}>
                      +{currentWin.coins} יחידות מלאי
                    </p>
                    {currentWin.streakBonus > 0 && (
                      <p className="text-indigo-400 text-[10px] font-black uppercase mt-1">כולל +{currentWin.streakBonus} בונוס רצף</p>
                    )}
                    <p className="text-slate-500 mt-4 text-sm font-bold uppercase tracking-[0.2em]">המחסן עודכן בהצלחה</p>
                  </div>
                )}

                {currentWin?.type === 'EMPTY' && (
                  <div className="mb-10 py-16 flex flex-col items-center opacity-30 grayscale">
                    <div className="text-9xl mb-6">📦</div>
                    <p className="text-2xl font-black text-slate-100 uppercase italic">מחסן ריק</p>
                    <p className="text-xs font-bold mt-2">רצף הזכיות נקטע</p>
                  </div>
                )}

                <button
                  onClick={() => { setShowRewardModal(false); setCurrentWin(null); }}
                  className={`w-full py-5 text-white text-xl font-black rounded-2xl transition-all shadow-xl active:scale-95 ${
                    currentWin?.isLucky ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-indigo-800'
                  }`}
                >
                  המשך בניהול המחסן
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      <footer className="mt-auto py-8 text-center text-slate-600">
        <p className="text-xs font-black tracking-widest opacity-50 uppercase">© NOAM GOLD AI 2025 • ALL RIGHTS RESERVED</p>
        <p className="text-[10px] mt-1 font-bold uppercase">WAREHOUSE STATUS: ENHANCED</p>
      </footer>
    </div>
  );
};

export default App;
