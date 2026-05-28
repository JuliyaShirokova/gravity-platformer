import * as Phaser from 'phaser';

export default class CollisionManager {
  /**
   * @param {Phaser.Scene} scene - Текущая сцена игры
   * @param {Object} player - Объект игрока
   * @param {Object} enemy - Объект врага
   */
  constructor(scene, player, enemy) {
    this.scene = scene;
    this.player = player;
    this.enemy = enemy;
  }

  // Настройка логики столкновения
  initEnemyCollision(onHit) {
    this.scene.physics.add.overlap(this.player.sprite, this.enemy.sprite, () => {
      // Вызываем переданную функцию обработки урона
      if (onHit) onHit();
    });
  }

  initEnemyStomp(onStomp) {
     this.scene.physics.add.overlap(this.player.sprite, this.enemy.sprite, () => {
      const isFalling = this.player.sprite.body.velocity.y > 0;
      const isAbove = this.player.sprite.y < this.enemy.sprite.y;

      // Если игрок падает и находится выше врага — это топтание
      if (isFalling && isAbove) {
        if (onStomp) onStomp();
      }
    });
  }

  // Метод для умной обработки столкновений
  initEnemyCollisions(onStomp, onDamage) {
    this.scene.physics.add.overlap(this.player.sprite, this.enemy.sprite, () => {
      // 1. Проверяем, "топчет" ли игрок врага
      const isFalling = this.player.sprite.body.velocity.y > 0;
      // Добавляем небольшой буфер (например, 20px), чтобы прыжок засчитывался увереннее
      const isAbove = this.player.sprite.y < this.enemy.sprite.y - 20;

      if (isFalling && isAbove) {
        // Если прыгнули сверху — вызываем логику убийства врага
        onStomp();
      } else {
        // Во всех остальных случаях (сбоку, снизу) — получаем урон
        onDamage();
      }
    });
  }
}