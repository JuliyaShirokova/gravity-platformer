import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, GRAVITY
} from './src/data/constants.js';
import { LEVELS } from './src/data/levels.js';
import Player from './src/entities/Player.js';
import Enemy from './src/entities/Enemy.js';
import CoinManager from './src/entities/CoinManager.js';
import { initAudio, initMusic, WIN_NOTES } from './src/systems/AudioSystem.js';
import createTextures from './src/systems/TextureManager.js';

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

  // Текстуры
  createTextures(this);
 
  // Звук и музыка
  initAudio(this);
  initMusic(this);

  // Платформы
  const platforms = this.physics.add.staticGroup();
  LEVEL_1.platforms.forEach(p => {
    platforms.create(p.x, p.y, 'tile').setDisplaySize(p.w, p.h).refreshBody();
  });

  // Монеты
 this.coinManager = new CoinManager(this, LEVEL_1.coins);

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
  this.coinManager.initOverlap(this.player, () => {
  this.score++;
  this.scoreText.setText('Монеты: ' + this.score);
  this.playSound(500, 900, 0.1);

   if (this.coinManager.count === 0) {
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

     let i = 0;
     this.time.addEvent({
        delay: 150,
        repeat: WIN_NOTES.length - 1,
        callback: () => {
          this.playSound(WIN_NOTES[i], WIN_NOTES[i], 0.15);
          i++;
        }
      });

      this.input.keyboard.once('keydown-SPACE', () => {
        winScreenObjects.forEach(obj => obj.destroy());

        this.coinManager.reset(LEVEL_1.coins);

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

  // Подсказка
  this.add.text(10, 478, 'S D движение  |  E прыжок вверх  |  X прыжок вниз  |  SHIFT гравитация', {
    fontSize: '10px', fill: '#aaaaaa'
  }).setScrollFactor(0);
}

function update() {
  if (!this.player) return;

  this.player.update();
  this.enemy.update(this.player.x, this.player.y);
}