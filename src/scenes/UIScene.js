import * as Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Текст монет
    this.scoreText = this.add.text(20, 20, 'Монеты: 0', { 
      fontSize: '24px', fill: '#ffffff' 
    }).setScrollFactor(0); // Фиксация на экране

    // Текст или иконка активного бонуса
    this.bonusText = this.add.text(20, 50, 'Бонус: Нет', { 
      fontSize: '20px', fill: '#ffff00' 
    }).setScrollFactor(0);
  }

  update() {
    // Получаем доступ к GameScene, чтобы "подглядывать" за состоянием игры
    const game = this.scene.get('GameScene');
    
    // Обновляем данные, если сцена игры запущена
    if (game.player) {
      this.scoreText.setText(`Монеты: ${game.coinsCount || 0}`);
      
      const bonusName = game.player.hasIceCream ? 'Мороженое' : 
                        (game.player.speedMultiplier > 1 ? 'Бургер' : 'Нет');
      this.bonusText.setText(`Бонус: ${bonusName}`);
    }
  }
}