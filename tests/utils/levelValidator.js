// tests/utils/levelValidator.js
import { GAME_WIDTH, GAME_HEIGHT } from '../../src/data/constants.js';

export function validateLevelData(data) {
  // --- 1. Проверка структуры ---
  const requiredKeys = ['platforms', 'playerStart', 'coins', 'enemyStart'];
  for (const key of requiredKeys) {
    if (!data[key]) throw new Error(`Отсутствует обязательное поле: ${key}`);
  }

  // --- 2. Логическая проверка: Монеты ---
  if (!Array.isArray(data.coins) || data.coins.length === 0) {
    throw new Error('Уровень не может быть пустым: добавьте хотя бы одну монету.');
  }

  // --- 3. Логическая проверка: Границы мира ---
  const checkBounds = (obj, name) => {
    if (obj.x < 0 || obj.x > GAME_WIDTH || obj.y < 0 || obj.y > GAME_HEIGHT) {
      throw new Error(`Объект ${name} находится вне границ игрового мира (${obj.x}, ${obj.y})`);
    }
  };

  checkBounds(data.playerStart, 'playerStart');
  checkBounds(data.enemyStart, 'enemyStart');

  // --- 4. Логическая проверка: Платформы ---
  data.platforms.forEach((p, index) => {
    if (p.w <= 0 || p.h <= 0) {
      throw new Error(`Платформа #${index} имеет недопустимый размер (w: ${p.w}, h: ${p.h})`);
    }
  });

  return true;
}