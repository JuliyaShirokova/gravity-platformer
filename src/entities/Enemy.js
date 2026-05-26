import * as Phaser from 'phaser';
import {
  ENEMY_PATROL_SPEED,
  ENEMY_CHASE_SPEED,
  ENEMY_CHASE_DIST,
  GAME_WIDTH
} from '../data/constants.js';

export default class Enemy {
  constructor(scene, x, y) {
    this.scene = scene;
    this.direction = 1;
    this.isChasing = false;

    this.sprite = scene.physics.add.sprite(x, y, 'enemy');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setVelocityX(ENEMY_PATROL_SPEED);
  }

  addCollider(platforms) {
    this.scene.physics.add.collider(this.sprite, platforms);
  }

  update(playerX, playerY) {
    // ЗАЩИТА: Если спрайт или его физическое тело еще не готовы, 
    // пропускаем этот кадр, чтобы избежать ошибок при перезагрузке сцены.
    if (!this.sprite || !this.sprite.body) {
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

    // Прыжок если стена впереди
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
    if (dist < ENEMY_CHASE_DIST) {
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
    this.direction = 1;
    this.sprite.clearTint();
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}