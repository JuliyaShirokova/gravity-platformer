// tests/levels.test.js
import fs from 'fs';
import path from 'path';
import { validateLevelData } from './utils/levelValidator.js';

describe('Level Logical Validation', () => {
  // Указываем путь к папке с уровнями
  const levelsPath = path.resolve(__dirname, '../assets/levels');
  const levelFiles = fs.readdirSync(levelsPath).filter(file => file.endsWith('.json'));

  test.each(levelFiles)('Логика уровня %s должна быть корректной', (filename) => {
    const filePath = path.join(levelsPath, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    let jsonData;

    // 1. Проверка JSON формата
    expect(() => {
      jsonData = JSON.parse(fileContent);
    }).not.toThrow(`Файл ${filename} содержит невалидный JSON`);

    // 2. Проверка бизнес-логики (наши новые проверки)
    // Мы вызываем нашу функцию валидации
    try {
      validateLevelData(jsonData);
    } catch (error) {
      // Если валидатор кинул ошибку, мы выбрасываем её с именем файла, чтобы сразу знать, где проблема
      throw new Error(`Ошибка валидации в ${filename}: ${error.message}`);
    }
  });
});