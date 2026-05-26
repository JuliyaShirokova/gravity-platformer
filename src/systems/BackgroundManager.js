import * as Phaser from 'phaser';

export default class BackgroundManager {
  /**
   * @param {Phaser.Scene} scene - Сцена Phaser
   * @param {number} width - Ширина игры
   * @param {number} height - Высота игры
   */
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    
    this.createBackground();
  }

  createBackground() {
    // Фон
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRect(0, 0, this.width, this.height);

    // Звезды
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, this.width);
      const y = Phaser.Math.Between(0, this.height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const brightness = Phaser.Math.Between(150, 255);
      
      bg.fillStyle(Phaser.Display.Color.GetColor(brightness, brightness, brightness));
      bg.fillRect(x, y, size, size);
    }
  }
}