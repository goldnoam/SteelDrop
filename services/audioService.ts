
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, volume: number = 0.1) => {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const sounds = {
  drop: () => {
    playTone(440, 'sine', 0.2, 0.1);
    setTimeout(() => playTone(880, 'sine', 0.1, 0.05), 50);
  },
  tick: () => {
    playTone(150, 'square', 0.05, 0.02);
  },
  winCoin: () => {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      setTimeout(() => playTone(f, 'triangle', 0.3, 0.1), i * 100);
    });
  },
  winHero: () => {
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sawtooth', 0.5, 0.05), i * 150);
    });
  },
  miss: () => {
    playTone(110, 'sine', 0.5, 0.1);
  }
};
