import * as Phaser from 'phaser';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  PLAYER_INVULNERABILITY_TIME 
} from './src/data/constants.js';
import BackgroundManager from './src/systems/BackgroundManager.js';
import Player from './src/entities/Player.js';
import Enemy from './src/entities/Enemy.js';
import CoinManager from './src/entities/CoinManager.js';
import CollisionManager from './src/systems/CollisionManager.js';
import CoinInteractionManager from './src/systems/CoinInteractionManager.js';
import GameStateManager from './src/systems/GameStateManager.js';
import { initAudio, initMusic } from './src/systems/AudioSystem.js';
import createTextures from './src/systems/TextureManager.js';
import LoadingManager from './src/systems/LoadingManager.js';

const levels = ['level1', 'level2', 'level3','level4', 'level5', 'level6', 'level7'];
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

    // 1. Инициализация систем
    new BackgroundManager(this, GAME_WIDTH, GAME_HEIGHT);
    createTextures(this);
    initAudio(this);
    initMusic(this);

    // Инициализация очков (сброс при старте игры)
    if (this.registry.get('totalScore') === undefined) {
        this.registry.set('totalScore', 0);
    }

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
    
    // 4. Физика
    this.physics.add.collider(this.player.sprite, platforms);
    this.enemy.addCollider(platforms);

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
      if (this.isInvulnerable) return;

      this.isInvulnerable = true;
      this.lives--;
      this.livesText.setText('❤️ x' + this.lives);
      this.playSound(100, 50, 0.3, 'sawtooth');
      
      this.player.sprite.setVelocityX(this.player.x < this.enemy.x ? -200 : 200);
      this.player.sprite.setVelocityY(this.player.gravityFlipped ? 300 : -300);
      
      if (this.lives <= 0) {
        this.gameStateManager.showEndScreen('GAME OVER', '#ff0000', `УРОВЕНЬ ${currentLevelIndex + 1}`, '');
        
        // Кнопка перезапуска: СБРАСЫВАЕМ ТОЛЬКО ОЧКИ, уровень оставляем текущим
        this.gameStateManager.addRestartButton(() => {
            this.registry.set('totalScore', 0); 
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
      let newScore = this.registry.get('totalScore') + 1;
      this.registry.set('totalScore', newScore);
      this.scoreText.setText('Монеты: ' + newScore);
    });

    // 8. UI
    this.lives = 3;
    this.livesText = this.add.text(740, 10, '❤️ x3', { fontSize: '14px', fill: '#ff4444' }).setScrollFactor(0);
    this.scoreText = this.add.text(10, 10, 'Монеты: ' + this.registry.get('totalScore'), { 
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