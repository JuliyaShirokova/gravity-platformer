import { GAME_WIDTH, GAME_HEIGHT } from '../data/constants.js';

export default class GameStateManager {
    constructor(scene, player, enemy, coinManager, levelData) {
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;
        this.coinManager = coinManager;
        this.levelData = levelData;
    }

    /**
     * Отображает экран окончания уровня.
     * @param {string} title - Статус уровня (напр. "ПОБЕДА!")
     * @param {string} color - Цвет текста статуса (напр. "#ffdd00")
     * @param {string} levelName - Название уровня (напр. "УРОВЕНЬ 1")
     * @param {string} promptText - Текст подсказки (по умолчанию "Продолжить путь")
     */
    showEndScreen(title, color, levelName, promptText = 'Продолжить путь') {
        // 1. Создаем темный полупрозрачный фон
        // setScrollFactor(0) закрепляет элемент на экране, чтобы он не уезжал при движении камеры
        this.scene.add.rectangle(
            GAME_WIDTH / 2, 
            GAME_HEIGHT / 2, 
            GAME_WIDTH, 
            GAME_HEIGHT, 
            0x000000, 
            0.8
        ).setScrollFactor(0);
        
        // 2. Имя уровня (Большой заголовок сверху)
        this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, levelName, { 
            fontSize: '64px', 
            fill: '#ffffff',
            fontStyle: 'bold' 
        }).setOrigin(0.5).setScrollFactor(0);

        // 3. Статус уровня (ПОБЕДА или GAME OVER)
        this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, title, { 
            fontSize: '48px', 
            fill: color 
        }).setOrigin(0.5).setScrollFactor(0);

        // 4. Инструкция для игрока
        this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, promptText, { 
            fontSize: '24px', 
            fill: '#cccccc' 
        }).setOrigin(0.5).setScrollFactor(0);
    }
}