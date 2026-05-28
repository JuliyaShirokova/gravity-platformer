/**
 * @jest-environment jsdom
 */

jest.mock('../src/systems/AudioSystem.js', () => ({
  playPoof: jest.fn()
}));
jest.mock('phaser', () => ({}));

import Enemy from '../src/entities/Enemy.js';
import { playPoof } from '../src/systems/AudioSystem.js';

describe('Enemy', () => {
  // 1. Объявляем переменные здесь, чтобы они были видны всем тестам
  let mockScene, enemy;

  beforeEach(() => {
    // 2. Инициализируем спрайт
    const mockSprite = {
      setCollideWorldBounds: jest.fn(),
      setVelocityX: jest.fn(),
      setVelocity: jest.fn(),
      setTint: jest.fn(),
      clearTint: jest.fn(),
      setFlipX: jest.fn(),
      destroy: jest.fn(),
      body: { 
        enable: true,
        blocked: { up: false, down: true, left: false, right: false }
      },
      x: 0,
      y: 0,
      active: true
    };

    // 3. Инициализируем сцену
    mockScene = {
      physics: {
        add: {
          sprite: jest.fn(() => mockSprite),
          collider: jest.fn()
        }
      },
      tweens: {
        add: jest.fn()
      },
      add: {
        particles: jest.fn(() => ({
          explode: jest.fn(),
          destroy: jest.fn()
        })),
        text: jest.fn(() => ({
          destroy: jest.fn(),
          setText: jest.fn(),
          setPosition: jest.fn()
        }))
      },
      time: {
        delayedCall: jest.fn()
      }
    };
    
    // 4. Создаем экземпляр врага
    enemy = new Enemy(mockScene, 0, 0);
  });

  test('die() должен вызывать звук и уничтожать спрайт', () => {
    // Теперь mockScene и enemy видны здесь!
    const destroySpy = jest.spyOn(enemy.sprite, 'destroy');
    
    enemy.die();

    expect(playPoof).toHaveBeenCalled();
    expect(destroySpy).toHaveBeenCalled();
  });
});