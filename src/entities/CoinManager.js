import Phaser from 'phaser';

export default class CoinManager {
  constructor(scene, coinPositions) {
    this.scene = scene;
    this.coins = this.scene.physics.add.staticGroup();
    
    // Создаем монеты на основе переданных позиций
    coinPositions.forEach(([x, y]) => {
      this.coins.create(x, y, 'coin').refreshBody();
    });
  }

  // Метод для инициализации столкновения с игроком
  initOverlap(player, onCoinCollect) {
   this.scene.physics.add.overlap(player.sprite, this.coins, (playerSprite, coin) => {
      coin.destroy();
      // Вызываем колбэк (функцию), переданную из основного файла, если нужно что-то сделать при сборе
     if (onCoinCollect) onCoinCollect(coin);
    });
  }

  // Метод для сброса монет (например, при перезапуске уровня)
  reset(coinPositions) {
    this.coins.clear(true, true);
    coinPositions.forEach(([x, y]) => {
      this.coins.create(x, y, 'coin').refreshBody();
    });
  }

  // Проверка, остались ли монеты
  get count() {
    return this.coins.countActive();
  }
}