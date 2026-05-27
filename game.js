import * as Phaser from 'phaser';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  PLAYER_INVULNERABILITY_TIME 
} from './src/data/constants.js';
import { GameStats } from './src/logic/GameStats.js';
import BackgroundManager from './src/systems/BackgroundManager.js';
import Player from './src/entities/Player.js';
import Enemy from './src/entities/Enemy.js';
import CoinManager from './src/entities/CoinManager.js';
import BonusManager from './src/systems/BonusManager.js'; // Новый импорт
import CollisionManager from './src/systems/CollisionManager.js';
import CoinInteractionManager from './src/systems/CoinInteractionManager.js';
import GameStateManager from './src/systems/GameStateManager.js';
import { initAudio, initMusic } from './src/systems/AudioSystem.js';
import createTextures from './src/systems/TextureManager.js';
import LoadingManager from './src/systems/LoadingManager.js';

const levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
let currentLevelIndex = 0;
let currentLevel = levels[currentLevelIndex];

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { 
      gravity: { y: GRAVITY }, 
      debug: true 
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
  new LoadingManager(this);
  this.cache.json.remove('levelData');
  this.load.json('levelData', `assets/levels/${currentLevel}.json`);
}

function create() {
  this.events.once('start-game', () => {
    const levelData = this.cache.json.get('levelData');

    this.isInvulnerable = false;
    
    // Инициализация статистики
    this.stats = new GameStats(3);

    // 1. Инициализация систем
    new BackgroundManager(this, GAME_WIDTH, GAME_HEIGHT);
    createTextures(this);
    initAudio(this);
    initMusic(this);

    // 2. Платформы
    const platforms = this.physics.add.staticGroup();
    levelData.platforms.forEach((p) => {
      const plat = platforms.create(p.x, p.y, 'tile');
      if (plat) {
          plat.setDisplaySize(p.w, p.h);
          plat.refreshBody();
      }
    });

    // 3. Сущности
    this.coinManager = new CoinManager(this, levelData.coins);
    this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);
    this.enemy = new Enemy(this, levelData.enemyStart.x, levelData.enemyStart.y);
    
    // Инициализация BonusManager
    this.bonusManager = new BonusManager(this, this.player, this.enemy);
    
    // Спавн бонусов из JSON уровня (если они там прописаны)
    if (levelData.bonuses) {
        levelData.bonuses.forEach(b => this.bonusManager.spawn(b.type, b.x, b.y));
    }
    
    // 4. Физика
    this.physics.add.collider(this.player.sprite, platforms);
    this.enemy.addCollider(platforms);

    // Оверлап для сбора бонусов
    this.physics.add.overlap(this.player.sprite, this.bonusManager.bonuses, (playerSprite, bonus) => {
      this.bonusManager.handleCollection(this.player, bonus);
    });

    this.collisionManager = new CollisionManager(this, this.player, this.enemy);
    this.gameStateManager = new GameStateManager(this, this.player, this.enemy, this.coinManager, levelData);
    
    // 5. Логика перехода уровней
    this.interactionManager = new CoinInteractionManager(this, this.coinManager, this.player, () => {
      if (currentLevelIndex < levels.length - 1) {
        this.gameStateManager.showEndScreen('УРОВЕНЬ ПРОЙДЕН!', '#ffdd00', `УРОВЕНЬ ${currentLevelIndex + 1}`);
        this.playSound(150, 50, 0.5, 'sawtooth');

        this.time.delayedCall(2000, () => {
            currentLevelIndex++;
            currentLevel = levels[currentLevelIndex];
            this.scene.restart();
        });
      } else {
        this.gameStateManager.showEndScreen('ИГРА ПРОЙДЕНА!', '#00ff00', 'ФИНАЛ', 'Спасибо за игру!');
        this.playSound(150, 50, 0.5, 'sawtooth');
      }
    });

    // 6. Логика столкновения с врагом
    this.collisionManager.initEnemyCollision(() => {
      // Проверка на заморозку врага (Мороженое)
      if (this.player.hasIceCream) {
          this.bonusManager.tryFreezeEnemy();
          return; 
      }

      if (this.isInvulnerable) return;

      this.isInvulnerable = true;
      const remainingLives = this.stats.takeDamage();
      this.livesText.setText('❤️ x' + remainingLives);
      this.playSound(100, 50, 0.3, 'sawtooth');
      
      this.player.sprite.setVelocityX(this.player.x < this.enemy.x ? -200 : 200);
      this.player.sprite.setVelocityY(this.player.gravityFlipped ? 300 : -300);
      
      if (this.stats.isGameOver) {
        this.gameStateManager.showEndScreen('GAME OVER', '#ff0000', `УРОВЕНЬ ${currentLevelIndex + 1}`, '');
        
        this.gameStateManager.addRestartButton(() => {
            this.stats.resetScore();
            this.scene.restart();
        });
      } else {
        this.time.delayedCall(PLAYER_INVULNERABILITY_TIME, () => {
          this.isInvulnerable = false;
        });
      }
    });

    // 7. Логика монет
    this.coinManager.initOverlap(this.player, (coin) => {
      this.interactionManager.handleCollection(coin);
      this.stats.addScore(1);
      this.scoreText.setText('Монеты: ' + this.stats.score);
    });

    // 8. UI
    this.livesText = this.add.text(740, 10, '❤️ x' + this.stats.lives, { fontSize: '14px', fill: '#ff4444' }).setScrollFactor(0);
    this.scoreText = this.add.text(10, 10, 'Монеты: ' + this.stats.score, { 
        fontSize: '14px', 
        fill: '#ffdd00' 
    }).setScrollFactor(0);
  });
}

function update() {
  if (!this.player || !this.player.sprite || !this.player.sprite.body) return;
  this.player.update();
  
  if (this.enemy && this.enemy.sprite && this.enemy.sprite.body) {
    this.enemy.update(this.player.x, this.player.y);
  }
}