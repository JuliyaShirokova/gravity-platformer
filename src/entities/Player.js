import * as Phaser from 'phaser';
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

    // ИЗМЕНЕНИЕ: Уменьшаем физическое тело (хитбокс)
    // Ширина спрайта 16px, мы делаем физическое тело 8px
    // setOffset(4, 0) центрирует это узкое тело (16-8)/2 = 4
    this.sprite.body.setSize(8, 24);
    this.sprite.body.setOffset(4, 0);

    // Состояние
    this.isJumping = false;
    this.gravityFlipped = false;

    // Бонусные состояния
    this.speedMultiplier = 1;
    this.jumpMultiplier = 1;
    this.hasIceCream = false;

    // Управление
    this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyX = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  }

  update() {
    // ЗАЩИТА: Если спрайт или его физическое тело еще не инициализированы 
    if (!this.sprite || !this.sprite.body) {
      return;
    }

    const body = this.sprite.body;
    const onGround = body.blocked.down || body.blocked.up;

    // Движение с учетом множителя скорости
    if (this.keyS.isDown) {
      this.sprite.setVelocityX(-PLAYER_SPEED * this.speedMultiplier);
      this.sprite.setFlipX(true);
    } else if (this.keyD.isDown) {
      this.sprite.setVelocityX(PLAYER_SPEED * this.speedMultiplier);
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

    // Прыжок вверх с учетом множителя прыжка
    if (Phaser.Input.Keyboard.JustDown(this.keyE) && onGround && !this.gravityFlipped && !this.isJumping) {
      this.sprite.setVelocityY(-PLAYER_JUMP * this.jumpMultiplier);
      this.isJumping = true;
      this.scene.playSound(200, 400, 0.15);
    }

    // Прыжок вниз при инвертированной гравитации с учетом множителя
    if (Phaser.Input.Keyboard.JustDown(this.keyX) && onGround && this.gravityFlipped && !this.isJumping) {
      this.sprite.setVelocityY(PLAYER_JUMP * this.jumpMultiplier);
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
    
    // Сброс бонусов
    this.speedMultiplier = 1;
    this.jumpMultiplier = 1;
    this.hasIceCream = false;
  }

  // Геттеры
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }
}