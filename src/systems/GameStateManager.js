// src/systems/GameStateManager.js
export default class GameStateManager {
  constructor(scene, player, enemy, coinManager, levelConfig) {
    this.scene = scene;
    this.player = player;
    this.enemy = enemy;
    this.coinManager = coinManager;
    this.levelConfig = levelConfig;
  }

  showEndScreen(title, color, onRestartCallback) {
    this.scene.physics.pause();
    const screenObjects = [];

    // Затемнение
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, this.scene.game.config.width, this.scene.game.config.height);
    screenObjects.push(overlay);

    // Заголовок
    screenObjects.push(this.scene.add.text(400, 240, title, {
      fontSize: '48px', fill: color
    }).setOrigin(0.5));

    // Инструкция
    screenObjects.push(this.scene.add.text(400, 300, 'Нажми ПРОБЕЛ для продолжения', {
      fontSize: '18px', fill: '#ffffff'
    }).setOrigin(0.5));

    this.scene.input.keyboard.once('keydown-SPACE', () => {
      screenObjects.forEach(obj => obj.destroy());
      this.resetGame();
      if (onRestartCallback) onRestartCallback();
      this.scene.physics.resume();
    });
  }

  resetGame() {
    this.coinManager.reset(this.levelConfig.coins);
    this.player.reset(this.levelConfig.playerStart.x, this.levelConfig.playerStart.y);
    this.enemy.reset(this.levelConfig.enemyStart.x, this.levelConfig.enemyStart.y);
    
    this.scene.score = 0;
    this.scene.lives = 3;
    this.scene.scoreText.setText('Монеты: 0');
    this.scene.livesText.setText('❤️ x3');
  }
}