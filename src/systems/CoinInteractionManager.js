// src/systems/CoinInteractionManager.js
export default class CoinInteractionManager {
  constructor(scene, coinManager, player, onWinCallback) {
    this.scene = scene;
    this.coinManager = coinManager;
    this.player = player;
    this.onWinCallback = onWinCallback; // Ссылка на метод победы в game.js
  }

  handleCollection(coin) {
    coin.destroy();
    
    // Обновление логики (счет, звук)
    this.scene.score++;
   // this.scene.scoreText.setText('Монеты: ' + this.scene.score);
    this.scene.playSound(500, 900, 0.1);

    // Проверка победы
    if (this.coinManager.count === 0) {
      this.onWinCallback();
    }
  }
}