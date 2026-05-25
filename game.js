import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, GRAVITY
} from './src/data/constants.js';
import { LEVELS } from './src/data/levels.js';
import Player from './src/entities/Player.js';
import Enemy from './src/entities/Enemy.js';

const LEVEL_1 = LEVELS[0];

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: GRAVITY }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {

  // Фон со звёздами
  const bg = this.add.graphics();
  bg.fillStyle(0x1a1a2e);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  for (let i = 0; i < 100; i++) {
    const x = Phaser.Math.Between(0, GAME_WIDTH);
    const y = Phaser.Math.Between(0, GAME_HEIGHT);
    const size = Phaser.Math.FloatBetween(0.5, 2);
    const brightness = Phaser.Math.Between(150, 255);
    bg.fillStyle(Phaser.Display.Color.GetColor(brightness, brightness, brightness));
    bg.fillRect(x, y, size, size);
  }

  // Текстура платформы
  if (this.textures.exists('tile')) this.textures.remove('tile');
  const tg = this.make.graphics({ x: 0, y: 0, add: false });
  tg.fillStyle(0x8B4513);
  tg.fillRect(0, 0, 32, 16);
  tg.fillStyle(0x228B22);
  tg.fillRect(0, 0, 32, 5);
  tg.fillStyle(0x33aa33);
  tg.fillRect(2, 1, 4, 3);
  tg.fillRect(10, 0, 3, 4);
  tg.fillRect(20, 1, 5, 3);
  tg.fillStyle(0x000000);
  tg.fillRect(0, 5, 32, 1);
  tg.generateTexture('tile', 32, 16);
  tg.destroy();

  // Текстура игрока
  if (this.textures.exists('player')) this.textures.remove('player');
  const pg = this.make.graphics({ x: 0, y: 0, add: false });
  const playerPixels = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,2,2,3,3,2,2,0],
    [0,2,3,3,3,3,2,0],
    [0,0,3,3,3,3,0,0],
    [0,4,4,4,4,4,4,0],
    [4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,4],
    [0,4,4,0,0,4,4,0],
    [0,5,5,0,0,5,5,0],
    [0,5,5,0,0,5,5,0],
    [0,6,6,0,0,6,6,0],
  ];
  const pColors = [0, 0xff0000, 0xffcc99, 0x000000, 0x0044ff, 0x8B4513, 0x8B6914];
  playerPixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        pg.fillStyle(pColors[val]);
        pg.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  pg.generateTexture('player', 16, 24);
  pg.destroy();

  // Текстура врага — слайм
  if (this.textures.exists('enemy')) this.textures.remove('enemy');
  const eg = this.make.graphics({ x: 0, y: 0, add: false });
  const enemyPixels = [
    [0,0,0,1,1,1,1,0],
    [0,0,1,1,1,1,1,1],
    [0,1,1,2,1,1,2,1],
    [0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,3,1,1,3,1,0],
    [0,0,1,1,1,1,0,0],
  ];
  const eColors = [0, 0xff3333, 0xffffff, 0x000000];
  enemyPixels.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val > 0) {
        eg.fillStyle(eColors[val]);
        eg.fillRect(x * 2, y * 2, 2, 2);
      }
    });
  });
  eg.generateTexture('enemy', 16, 16);
  eg.destroy();

  // Текстура монеты
  if (this.textures.exists('coin')) this.textures.remove('coin');
  const cg = this.make.graphics({ x: 0, y: 0, add: false });
  cg.fillStyle(0xffdd00);
  cg.fillCircle(6, 6, 6);
  cg.fillStyle(0xffaa00);
  cg.fillCircle(6, 6, 4);
  cg.fillStyle(0xffff88);
  cg.fillRect(4, 3, 2, 2);
  cg.generateTexture('coin', 12, 12);
  cg.destroy();

  // Платформы
  const platforms = this.physics.add.staticGroup();
  LEVEL_1.platforms.forEach(p => {
    platforms.create(p.x, p.y, 'tile').setDisplaySize(p.w, p.h).refreshBody();
  });

  // Монеты
  this.coins = this.physics.add.staticGroup();
  const coinPositions = LEVEL_1.coins;
  coinPositions.forEach(([x, y]) => {
    this.coins.create(x, y, 'coin').refreshBody();
  });

  // Игрок
  this.player = new Player(this, LEVEL_1.playerStart.x, LEVEL_1.playerStart.y);
  this.physics.add.collider(this.player.sprite, platforms);

  // Враг
  this.enemy = new Enemy(this, LEVEL_1.enemyStart.x, LEVEL_1.enemyStart.y);
  this.enemy.addCollider(platforms);

  // Жизни
  this.lives = 3;
  this.livesText = this.add.text(740, 10, '❤️ x3', {
    fontSize: '14px', fill: '#ff4444'
  }).setScrollFactor(0);

  // Счёт
  this.score = 0;
  this.scoreText = this.add.text(10, 10, 'Монеты: 0', {
    fontSize: '14px', fill: '#ffdd00'
  }).setScrollFactor(0);

  // Сбор монет
  this.physics.add.overlap(this.player.sprite, this.coins, (playerSprite, coin) => {
    coin.destroy();
    this.score++;
    this.scoreText.setText('Монеты: ' + this.score);
    this.playSound(500, 900, 0.1);

    if (this.coins.countActive() === 0) {
      this.physics.pause();

      const winScreenObjects = [];

      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.6);
      overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      winScreenObjects.push(overlay);

      winScreenObjects.push(this.add.text(GAME_WIDTH/2, 180, '🎉 УРОВЕНЬ ПРОЙДЕН!', {
        fontSize: '36px', fill: '#ffdd00'
      }).setOrigin(0.5));

      winScreenObjects.push(this.add.text(GAME_WIDTH/2, 250, 'Монеты: ' + this.score + ' / 6', {
        fontSize: '22px', fill: '#ffffff'
      }).setOrigin(0.5));

      winScreenObjects.push(this.add.text(GAME_WIDTH/2, 310, 'Нажми ПРОБЕЛ для продолжения', {
        fontSize: '16px', fill: '#aaaaaa'
      }).setOrigin(0.5));

      const winNotes = [262, 330, 392, 523, 392, 523, 659];
      let i = 0;
      this.time.addEvent({
        delay: 150,
        repeat: winNotes.length - 1,
        callback: () => {
          this.playSound(winNotes[i], winNotes[i], 0.15);
          i++;
        }
      });

      this.input.keyboard.once('keydown-SPACE', () => {
        winScreenObjects.forEach(obj => obj.destroy());

        coinPositions.forEach(([x, y]) => {
          this.coins.create(x, y, 'coin').refreshBody();
        });

        this.player.reset(LEVEL_1.playerStart.x, LEVEL_1.playerStart.y);
        this.enemy.reset(LEVEL_1.enemyStart.x, LEVEL_1.enemyStart.y);

        this.score = 0;
        this.lives = 3;
        this.scoreText.setText('Монеты: 0');
        this.livesText.setText('❤️ x3');

        this.physics.resume();
      });
    }
  });

  // Столкновение с врагом
  this.physics.add.overlap(this.player.sprite, this.enemy.sprite, () => {
    this.lives--;
    this.livesText.setText('❤️ x' + this.lives);
    this.playSound(100, 50, 0.3, 'sawtooth');
    this.player.sprite.setVelocityX(this.player.x < this.enemy.x ? -GRAVITY : GRAVITY);
    this.player.sprite.setVelocityY(this.player.gravityFlipped ? GRAVITY : -GRAVITY);

    if (this.lives <= 0) {
      this.physics.pause();

      const gameOverObjects = [];

      const goOverlay = this.add.graphics();
      goOverlay.fillStyle(0x000000, 0.7);
      goOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      gameOverObjects.push(goOverlay);

      gameOverObjects.push(this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - 60, 'GAME OVER', {
        fontSize: '48px', fill: '#ff0000'
      }).setOrigin(0.5));

      gameOverObjects.push(this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + 20, 'Нажми ПРОБЕЛ чтобы начать заново', {
        fontSize: '18px', fill: '#ffffff'
      }).setOrigin(0.5));

      this.playSound(150, 50, 0.5, 'sawtooth');

      this.input.keyboard.once('keydown-SPACE', () => {
        gameOverObjects.forEach(obj => obj.destroy());

        coinPositions.forEach(([x, y]) => {
          this.coins.create(x, y, 'coin').refreshBody();
        });

        this.player.reset(LEVEL_1.playerStart.x, LEVEL_1.playerStart.y);
        this.enemy.reset(LEVEL_1.enemyStart.x, LEVEL_1.enemyStart.y);

        this.score = 0;
        this.lives = 3;
        this.scoreText.setText('Монеты: 0');
        this.livesText.setText('❤️ x3');

        this.physics.resume();
      });
    }
  });

  // Звуки
  this.playSound = function(freq1, freq2, duration, type = 'square') {
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
  }.bind(this);

  // Подсказка
  this.add.text(10, 478, 'S D движение  |  E прыжок вверх  |  X прыжок вниз  |  SHIFT гравитация', {
    fontSize: '10px', fill: '#aaaaaa'
  }).setScrollFactor(0);

  // Музыка после первого нажатия
  const notes = [329,329,0,329,0,262,329,0,392,0,0,0,196,0,0,0];
  let noteIndex = 0;
  const noteTime = (60 / 140) * 0.5;

  this.input.keyboard.once('keydown', () => {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.time.addEvent({
      delay: noteTime * 1000,
      loop: true,
      callback: () => {
        const freq = notes[noteIndex % notes.length];
        if (freq > 0) {
          const ctx = this.audioCtx;
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

function update() {
  if (!this.player) return;

  this.player.update();
  this.enemy.update(this.player.x, this.player.y);
}