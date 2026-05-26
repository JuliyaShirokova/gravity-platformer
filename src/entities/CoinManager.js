import * as Phaser from 'phaser';

export default class CoinManager {
  constructor(scene, coins) {
    // 1. Сохраняем сцену, чтобы использовать её в других методах
    this.scene = scene; 

    // 2. Создаем группу монет (используем this.scene)
    this.coins = this.scene.physics.add.staticGroup();

    // 3. Защита: проверяем, является ли coins массивом
    if (Array.isArray(coins)) {
        coins.forEach(c => {
            const coin = this.coins.create(c.x, c.y, 'coin'); 
            coin.setImmovable(true);
        });
    } else {
        console.warn("CoinManager: список монет не найден или пуст.");
    }
  }

  // Метод для инициализации столкновения с игроком
  initOverlap(player, onCoinCollect) {
    // Теперь this.scene работает!
    this.scene.physics.add.overlap(player.sprite, this.coins, (playerSprite, coin) => {
      coin.destroy();
      if (onCoinCollect) onCoinCollect(coin);
    });
  }

 // Метод для сброса монет
  reset(coinPositions) {
    // 1. Очищаем группу
    this.coins.clear(true, true);

    // 2. Безопасная проверка: является ли входной аргумент массивом
    if (Array.isArray(coinPositions)) {
      // 3. Используем перебор объектов {x, y}, как в конструкторе
      coinPositions.forEach(c => {
        // Проверяем, что у объекта есть x и y перед созданием
        if (c && typeof c.x !== 'undefined' && typeof c.y !== 'undefined') {
            this.coins.create(c.x, c.y, 'coin').refreshBody();
        }
      });
    } else {
      console.warn("CoinManager: reset() вызван с неверными данными. Ожидался массив объектов.");
    }
  }

  // Проверка, остались ли монеты
  get count() {
    return this.coins.countActive();
  }
}