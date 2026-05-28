import * as Phaser from 'phaser';
import {
  ENEMY_PATROL_SPEED,
  ENEMY_CHASE_SPEED,
  ENEMY_CHASE_DIST,
  GAME_WIDTH
} from '../data/constants.js';
import { playPoof } from '../systems/AudioSystem.js';

export default class Enemy {
  constructor(scene, x, y) {
    this.scene = scene;
    this.direction = 1;
    this.isChasing = false;
    this.isFrozen = false; 

    this.sprite = scene.physics.add.sprite(x, y, 'enemy');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setVelocityX(ENEMY_PATROL_SPEED);
  }

  addCollider(platforms) {
    this.scene.physics.add.collider(this.sprite, platforms);
  }

  // --- Новые методы для управления жизнью врага ---

  stop() {
    this.sprite.setVelocity(0, 0);
    this.sprite.body.enable = false; // Отключаем физику, чтобы игрок мог пройти сквозь "трупик"
    
    // Обязательно удаляем индикатор опасности, чтобы он не висел в воздухе
    if (this.dangerText) {
      this.dangerText.destroy();
      this.dangerText = null;
    }
  }

  die() {
  // 1. Проигрываем наш синтезированный звук (никаких внешних файлов!)
    playPoof(this.scene);
    
    // 2. Останавливаем физику и очищаем индикаторы
    this.stop();

    // 3. Создаем систему частиц (Эмиттер)
    const emitter = this.scene.add.particles(this.sprite.x, this.sprite.y, 'enemy', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      quantity: 15,
      rotate: { min: 0, max: 360 }
    });

    // 4. Запускаем "взрыв" и уничтожаем спрайт
    emitter.explode(15); 
    this.sprite.destroy();

    // 5. Удаляем эмиттер из памяти через полсекунды
    this.scene.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  // ----------------------------------------------

  freeze(duration) {
    this.isFrozen = true;
    this.sprite.setVelocityX(0);
    this.sprite.setTint(0x00ffff);
    
    this.scene.time.delayedCall(duration, () => {
      this.isFrozen = false;
      this.sprite.clearTint();
    });
  }

  update(playerX, playerY) {
    // Если враг был удален (умер), метод update вызывать нельзя
    if (!this.sprite || !this.sprite.body || !this.sprite.active) {
      return;
    }

    if (this.isFrozen) {
      this.sprite.setVelocityX(0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      playerX, playerY,
      this.sprite.x, this.sprite.y
    );

    if (dist < ENEMY_CHASE_DIST) {
      this._chase(playerX);
    } else {
      this._patrol();
    }

    this._updateDangerIndicator(dist);
  }

  _chase(playerX) {
    if (!this.isChasing) {
      this.isChasing = true;
      this.sprite.setTint(0xff0000);
      this.scene.playSound(300, 600, 0.2, 'sawtooth');
    }

    const diffX = playerX - this.sprite.x;
    if (Math.abs(diffX) > 10) {
      const speed = diffX < 0 ? -ENEMY_CHASE_SPEED : ENEMY_CHASE_SPEED;
      this.sprite.setVelocityX(speed);
      this.sprite.setFlipX(diffX < 0);
    } else {
      this.sprite.setVelocityX(0);
    }

    if ((this.sprite.body.blocked.right || this.sprite.body.blocked.left)
         && this.sprite.body.blocked.down) {
      this.sprite.setVelocityY(-400);
    }
  }

  _patrol() {
    if (this.isChasing) {
      this.isChasing = false;
      this.sprite.clearTint();
    }

    if (this.sprite.body.blocked.right || this.sprite.x >= GAME_WIDTH - 20) {
      this.direction = -1;
    } else if (this.sprite.body.blocked.left || this.sprite.x <= 20) {
      this.direction = 1;
    }

    this.sprite.setVelocityX(ENEMY_PATROL_SPEED * this.direction);
    this.sprite.setFlipX(this.direction < 0);
  }

  _updateDangerIndicator(dist) {
    if (!this.dangerText) {
      this.dangerText = this.scene.add.text(0, 0, '', {
        fontSize: '12px', fill: '#ff0000'
      });
    }
    
    if (!this.isFrozen && dist < ENEMY_CHASE_DIST) {
      this.dangerText.setText('❗');
      this.dangerText.setPosition(this.sprite.x - 6, this.sprite.y - 30);
    } else {
      this.dangerText.setText('');
    }
  }

  reset(x, y) {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(ENEMY_PATROL_SPEED, 0);
    this.isChasing = false;
    this.isFrozen = false;
    this.direction = 1;
    this.sprite.clearTint();
    this.sprite.body.enable = true; // Включаем физику обратно
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}