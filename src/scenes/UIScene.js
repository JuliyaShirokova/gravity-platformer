import * as Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const y = 20;
    const width = this.cameras.main.width; // Получаем ширину экрана автоматически

    // 1. Монеты (Слева)
    this.coinIcon = this.add.image(20, y, 'coin')
        .setScrollFactor(0)
        .setOrigin(0, 0.5);

    this.scoreText = this.add.text(40, y, '0', { 
      fontSize: '20px', fill: '#ffffff' 
    }).setScrollFactor(0).setOrigin(0, 0.5);

    // 2. Бонусы (Чуть правее монет)
    this.burgerIcon = this.add.image(120, y, 'burger')
        .setVisible(false)
        .setScrollFactor(0);
        
    this.icecreamIcon = this.add.image(160, y, 'icecream')
        .setVisible(false)
        .setScrollFactor(0);

    // 3. Жизни (Справа)
    // width - 20 — это отступ от правого края
    // setOrigin(1, 0.5) — привязывает ПРАВЫЙ край текста к этой координате
    this.livesText = this.add.text(width - 20, y, '❤️ x3', { 
      fontSize: '20px', fill: '#ff4444' 
    }).setScrollFactor(0).setOrigin(1, 0.5);
  }

  update() {
    const game = this.scene.get('GameScene');
    
    if (game && game.player && game.stats) {
      this.scoreText.setText(game.stats.score.toString());
      this.livesText.setText('❤️ x' + game.stats.lives);

      this.burgerIcon.setVisible(game.player.speedMultiplier > 1);
      this.icecreamIcon.setVisible(game.player.hasIceCream);
    }
  }
}