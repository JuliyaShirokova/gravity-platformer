// src/systems/LoadingManager.js
export default class LoadingManager {
  constructor(scene) {
    this.scene = scene;
    
    // Создаем графику
    this.progressBar = this.scene.add.graphics();
    this.progressBox = this.scene.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(240, 270, 320, 50);

    // Добавляем слушатели
    this.scene.load.on('progress', (value) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(250, 280, 300 * value, 30);
    });

    this.scene.load.on('complete', () => {
      this.onLoadComplete();
    });
    
    // Если progress равен 1, значит всё уже загружено
    if (this.scene.load.progress === 1) {
      this.onLoadComplete();
    }
  }

  onLoadComplete() {
    // Убираем прогресс-бар, если он существует
    if (this.progressBar) this.progressBar.destroy();
    if (this.progressBox) this.progressBox.destroy();

    // Добавляем текст "Нажми, чтобы начать"
    const startText = this.scene.add.text(400, 300, 'Нажми, чтобы начать', {
      fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);

    // Ждем клика
    this.scene.input.once('pointerdown', () => {
      startText.destroy();
      this.scene.events.emit('start-game');
    });
  }
}