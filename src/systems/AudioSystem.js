export function initAudio(scene) {
  scene.playSound = function(freq1, freq2, duration, type = 'square') {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }.bind(scene);
}

export function initMusic(scene) {
  const notes = [329,329,0,329,0,262,329,0,392,0,0,0,196,0,0,0];
  let noteIndex = 0;
  const noteTime = (60 / 140) * 0.5;

  scene.input.keyboard.once('keydown', () => {
    scene.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    scene.time.addEvent({
      delay: noteTime * 1000,
      loop: true,
      callback: () => {
        const freq = notes[noteIndex % notes.length];
        if (freq > 0) {
          const ctx = scene.audioCtx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + noteTime * 0.8);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + noteTime);
        }
        noteIndex++;
      }
    });
  });
}

export function playPoof(scene) {
  if (!scene.audioCtx) return;
  const ctx = scene.audioCtx;
  
  // Создаем буфер для "белого шума" (длительность 0.3 сек)
  const duration = 0.3;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Заполняем буфер случайными числами (это и есть шум)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  
  // Быстрое затухание для эффекта "пуф"
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  noise.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

export const WIN_NOTES  = [262, 330, 392, 523, 392, 523, 659];
export const LOSE_NOTES = [150, 50];