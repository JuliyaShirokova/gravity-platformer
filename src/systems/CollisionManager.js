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

  // Можно добавить дополнительные типы взаимодействий, например, 
  // если игрок прыгает на врага сверху (система топтания)
  initEnemyStomp(onStomp) {
     // Здесь можно было бы реализовать логику "прыжка на врага"
  }
}