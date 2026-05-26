import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './src/data/constants.js';
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

// Конфигурация игры
const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { 
      gravity: { y: GRAVITY }, 
      debug: true // Оставляем true, пока не настроим все платформы идеально
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
  // Загружаем ресурсы
  new LoadingManager(this);
  this.load.json('level1', 'assets/levels/level1.json');
}

function create() {
  // Ждем события начала игры (от загрузчика)
  this.events.once('start-game', () => {
    const levelData = this.cache.json.get('level1');

    // 1. Инициализация систем
    new BackgroundManager(this, GAME_WIDTH, GAME_HEIGHT);
    createTextures(this);
    initAudio(this);
    initMusic(this);

    // 2. Инициализация глобального счета (Registry)
    if (this.registry.get('totalScore') === undefined) {
        this.registry.set('totalScore', 0);
    }

    // 3. Создание платформ с проверкой границ
    const platforms = this.physics.add.staticGroup();
    levelData.platforms.forEach((p, index) => {
      // Проверка: находится ли платформа в пределах видимого мира
      if (p.x < 0 || p.x > GAME_WIDTH || p.y < 0 || p.y > GAME_HEIGHT) {
          console.error(`ВНИМАНИЕ: Платформа ${index} вне видимости! Координаты: ${p.x}, ${p.y}`);
      }
      
      const plat = platforms.create(p.x, p.y, 'tile');
      if (!plat) {
          console.error(`!!! ПЛАТФОРМА ${index} НЕ СОЗДАНА !!!`);
      } else {
          plat.setDisplaySize(p.w, p.h);
          plat.refreshBody();
      }
    });

    // 4. Инициализация игровых сущностей
    this.coinManager = new CoinManager(this, levelData.coins);
    this.player = new Player(this, levelData.playerStart.x, levelData.playerStart.y);
    this.enemy = new Enemy(this, levelData.enemyStart.x, levelData.enemyStart.y);
    
    // 5. Физика и столкновения
    this.physics.add.collider(this.player.sprite, platforms);
    this.enemy.addCollider(platforms);

    this.collisionManager = new CollisionManager(this, this.player, this.enemy);
    this.gameStateManager = new GameStateManager(this, this.player, this.enemy, this.coinManager, levelData);
    
    // Менеджер взаимодействия с монетами
    this.interactionManager = new CoinInteractionManager(this, this.coinManager, this.player, () => {
      this.gameStateManager.showEndScreen('УРОВЕНЬ ПРОЙДЕН!', '#ffdd00');
      this.playSound(150, 50, 0.5, 'sawtooth');
    });

    // Логика столкновения с врагом
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

    // 6. Логика сбора монет (Обновление глобального счета)
    this.coinManager.initOverlap(this.player, (coin) => {
      this.interactionManager.handleCollection(coin);
      
      // Обновляем глобальный счет в реестре
      let newScore = this.registry.get('totalScore') + 1;
      this.registry.set('totalScore', newScore);
      
      // Обновляем текст на экране
      this.scoreText.setText('Монеты: ' + newScore);
    });

    // 7. Создание UI (Интерфейса)
    this.lives = 3;
    this.livesText = this.add.text(740, 10, '❤️ x3', { fontSize: '14px', fill: '#ff4444' }).setScrollFactor(0);
    
    // Начальный вывод текста счетом из registry
    this.scoreText = this.add.text(10, 10, 'Монеты: ' + this.registry.get('totalScore'), { 
        fontSize: '14px', 
        fill: '#ffdd00' 
    }).setScrollFactor(0);
  });
}

function update() {
  if (!this.player) return;
  this.player.update();
  this.enemy.update(this.player.x, this.player.y);
}