import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './src/data/constants.js';
import { LEVELS } from './src/data/levels.js';
import BackgroundManager from './src/systems/BackgroundManager.js';
import Player from './src/entities/Player.js';
import Enemy from './src/entities/Enemy.js';
import CoinManager from './src/entities/CoinManager.js';
import CollisionManager from './src/systems/CollisionManager.js';
import CoinInteractionManager from './src/systems/CoinInteractionManager.js';
import GameStateManager from './src/systems/GameStateManager.js';
import { initAudio, initMusic, WIN_NOTES } from './src/systems/AudioSystem.js';
import createTextures from './src/systems/TextureManager.js';
import LoadingManager from './src/systems/LoadingManager.js';

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

function preload() {
    // Здесь добавляем загрузку всех ресурсов (load.image, load.audio и т.д.)
}

function create() {
  // 1. Инициализируем загрузчик
  new LoadingManager(this);

  // 2. Ждем сигнал от загрузчика (нажатие кнопки "Начать")
  this.events.once('start-game', () => {

    new BackgroundManager(this, GAME_WIDTH, GAME_HEIGHT);
    createTextures(this);
    initAudio(this);
    initMusic(this);

    const platforms = this.physics.add.staticGroup();
    LEVEL_1.platforms.forEach(p => {
      platforms.create(p.x, p.y, 'tile').setDisplaySize(p.w, p.h).refreshBody();
    });

    this.coinManager = new CoinManager(this, LEVEL_1.coins);
    this.player = new Player(this, LEVEL_1.playerStart.x, LEVEL_1.playerStart.y);
    this.enemy = new Enemy(this, LEVEL_1.enemyStart.x, LEVEL_1.enemyStart.y);
    
    this.physics.add.collider(this.player.sprite, platforms);
    this.enemy.addCollider(platforms);

    this.collisionManager = new CollisionManager(this, this.player, this.enemy);
    
    // Инициализация менеджеров
    this.gameStateManager = new GameStateManager(this, this.player, this.enemy, this.coinManager, LEVEL_1);
    this.interactionManager = new CoinInteractionManager(this, this.coinManager, this.player, () => {
      // Логика победы
      this.gameStateManager.showEndScreen('УРОВЕНЬ ПРОЙДЕН!', '#ffdd00', () => {
         // Дополнительная логика после рестарта
      });
      this.playSound(150, 50, 0.5, 'sawtooth');
    });

    // Логика столкновения
    this.collisionManager.initEnemyCollision(() => {
      this.lives--;
      this.livesText.setText('❤️ x' + this.lives);
      this.playSound(100, 50, 0.3, 'sawtooth');
      this.player.sprite.setVelocityX(this.player.x < this.enemy.x ? -200 : 200);
      this.player.sprite.setVelocityY(this.player.gravityFlipped ? 300 : -300);
      
      if (this.lives <= 0) {
        this.gameStateManager.showEndScreen('GAME OVER', '#ff0000');
      }
    });

    this.coinManager.initOverlap(this.player, (coin) => {
      this.interactionManager.handleCollection(coin);
    });

    // UI - инициализируем здесь, чтобы не было ошибок доступа
    this.lives = 3;
    this.livesText = this.add.text(740, 10, '❤️ x3', { fontSize: '14px', fill: '#ff4444' }).setScrollFactor(0);
    this.score = 0;
    this.scoreText = this.add.text(10, 10, 'Монеты: 0', { fontSize: '14px', fill: '#ffdd00' }).setScrollFactor(0);

    // Подсказка
    this.add.text(10, 478, 'S D движение  |  E прыжок вверх  |  X прыжок вниз  |  SHIFT гравитация', {
      fontSize: '10px', fill: '#aaaaaa'
    }).setScrollFactor(0);
    
  }); // Закрытие start-game
} // Закрытие create

function update() {
  if (!this.player) return;
  this.player.update();
  this.enemy.update(this.player.x, this.player.y);
}