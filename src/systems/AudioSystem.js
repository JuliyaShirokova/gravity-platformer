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

export const WIN_NOTES  = [262, 330, 392, 523, 392, 523, 659];
export const LOSE_NOTES = [150, 50];