 import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_JUMP,
  PLAYER_HEAD_BOUNCE, GRAVITY
} from '../data/constants.js';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Создаём спрайт
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setBounce(0).setCollideWorldBounds(true);

    // Состояние
    this.isJumping = false;
    this.gravityFlipped = false;

    // Управление
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  update() {
    const body = this.sprite.body;
    const onGround = body.blocked.down || body.blocked.up;

    // Движение
    if (this.keyS.isDown) {
      this.sprite.setVelocityX(-PLAYER_SPEED);
      this.sprite.setFlipX(true);
    } else if (this.keyD.isDown) {
      this.sprite.setVelocityX(PLAYER_SPEED);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
    }

    // Приземление
    if (onGround) {
      this.isJumping = false;
    }

    // Удар головой о потолок
    if (body.blocked.up && body.velocity.y < 0) {
      this.sprite.setVelocityY(body.velocity.y * -PLAYER_HEAD_BOUNCE);
      this.scene.playSound(180, 80, 0.08, 'square');
    }

    // Удар головой при инвертированной гравитации
    if (body.blocked.down && body.velocity.y > 0 && this.gravityFlipped) {
      this.sprite.setVelocityY(body.velocity.y * -PLAYER_HEAD_BOUNCE);
      this.scene.playSound(180, 80, 0.08, 'square');
    }

    // Прыжок вверх
    if (Phaser.Input.Keyboard.JustDown(this.keyE) && onGround && !this.gravityFlipped && !this.isJumping) {
      this.sprite.setVelocityY(-PLAYER_JUMP);
      this.isJumping = true;
      this.scene.playSound(200, 400, 0.15);
    }

    // Прыжок вниз при инвертированной гравитации
    if (Phaser.Input.Keyboard.JustDown(this.keyX) && onGround && this.gravityFlipped && !this.isJumping) {
      this.sprite.setVelocityY(PLAYER_JUMP);
      this.isJumping = true;
      this.scene.playSound(200, 400, 0.15);
    }

    // Инверсия гравитации
    if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
      this.gravityFlipped = !this.gravityFlipped;
      this.scene.physics.world.gravity.y = this.gravityFlipped ? -GRAVITY : GRAVITY;
      this.sprite.setFlipY(this.gravityFlipped);
      this.scene.playSound(400, 100, 0.25, 'sawtooth');
    }
  }

  // Позиция для сброса
  reset(x, y) {
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);
    this.gravityFlipped = false;
    this.isJumping = false;
    this.sprite.setFlipY(false);
    this.scene.physics.world.gravity.y = GRAVITY;
  }

  // Геттер для удобного доступа к позиции
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }
}