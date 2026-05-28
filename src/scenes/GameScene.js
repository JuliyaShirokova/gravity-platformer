import * as Phaser from 'phaser';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  PLAYER_INVULNERABILITY_TIME 
} from '../data/constants.js';
import { GameStats } from '../logic/GameStats.js';
import BackgroundManager from '../systems/BackgroundManager.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import CoinManager from '../entities/CoinManager.js';
import BonusManager from '../systems/BonusManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import CoinInteractionManager from '../systems/CoinInteractionManager.js';
import GameStateManager from '../systems/GameStateManager.js';
import { initAudio, initMusic } from '../systems/AudioSystem.js';
import createTextures from '../systems/TextureManager.js';
import LoadingManager from '../systems/LoadingManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
    this.currentLevelIndex = 0;
  }

  preload() {
    new LoadingManager(this);
    this.cache.json.remove('levelData');
    this.load.json('levelData', `assets/levels/${this.levels[this.currentLevelIndex]}.json`);
  }

  create() {
    // Запускаем UI сцену поверх игры
    this.scene.launch('UIScene');

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
    
    if (levelData.bonuses) {
        levelData.bonuses.forEach(b => this.bonusManager.spawn(b.type, b.x, b.y));
    }
    
    // 4. Физика
    this.physics.add.collider(this.player.sprite, platforms);
    this.enemy.addCollider(platforms);

    this.physics.add.overlap(this.player.sprite, this.bonusManager.bonuses, (playerSprite, bonus) => {
      this.bonusManager.handleCollection(this.player, bonus);
    });

    this.collisionManager = new CollisionManager(this, this.player, this.enemy);
    this.gameStateManager = new GameStateManager(this, this.player, this.enemy, this.coinManager, levelData);
    
    // 5. Логика перехода уровней
    this.interactionManager = new CoinInteractionManager(this, this.coinManager, this.player, () => {
      if (this.currentLevelIndex < this.levels.length - 1) {
        this.gameStateManager.showEndScreen('УРОВЕНЬ ПРОЙДЕН!', '#ffdd00', `УРОВЕНЬ ${this.currentLevelIndex + 1}`);
        this.playSound(150, 50, 0.5, 'sawtooth');

        this.time.delayedCall(2000, () => {
            this.currentLevelIndex++;
            this.scene.restart();
        });
      } else {
        this.gameStateManager.showEndScreen('ИГРА ПРОЙДЕНА!', '#00ff00', 'ФИНАЛ', 'Спасибо за игру!');
        this.playSound(150, 50, 0.5, 'sawtooth');
      }
    });

    // 6. Логика столкновения с врагом (ОБЪЕДИНЕННАЯ)
    this.collisionManager.initEnemyCollisions(
        // Callback: Враг повержен (прыжок сверху)
        () => {
            this.enemy.die();
            this.player.sprite.body.velocity.y = -300; 
        },
        // Callback: Игрок получил урон (столкновение сбоку)
        () => {
            if (this.player.hasIceCream) {
                this.bonusManager.tryFreezeEnemy();
                return; 
            }

            if (this.isInvulnerable) return;

            this.isInvulnerable = true;
            this.stats.takeDamage();
            
            this.playSound(100, 50, 0.3, 'sawtooth');
            
            this.player.sprite.setVelocityX(this.player.x < this.enemy.x ? -200 : 200);
            this.player.sprite.setVelocityY(this.player.gravityFlipped ? 300 : -300);
            
            if (this.stats.isGameOver) {
                this.gameStateManager.showEndScreen('GAME OVER', '#ff0000', `УРОВЕНЬ ${this.currentLevelIndex + 1}`, '');
                
                this.gameStateManager.addRestartButton(() => {
                    this.stats.resetScore();
                    this.scene.restart();
                });
            } else {
                this.time.delayedCall(PLAYER_INVULNERABILITY_TIME, () => {
                this.isInvulnerable = false;
                });
            }
        }
    );

    // 7. Логика монет
    this.coinManager.initOverlap(this.player, (coin) => {
      this.interactionManager.handleCollection(coin);
      this.stats.addScore(1);
    });
  }

  update() {
    if (!this.player || !this.player.sprite || !this.player.sprite.body) return;
    this.player.update();
    
    if (this.enemy && this.enemy.sprite && this.enemy.sprite.body) {
      this.enemy.update(this.player.x, this.player.y);
    }
  }
}