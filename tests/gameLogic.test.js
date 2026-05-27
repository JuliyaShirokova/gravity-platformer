// tests/GameStats.test.js
import { GameStats } from '../src/logic/GameStats';

describe('GameStats', () => {
    
    test('Инициализация: должно быть 3 жизни и 0 очков', () => {
        const stats = new GameStats(3);
        expect(stats.lives).toBe(3);
        expect(stats.score).toBe(0);
    });

    test('addScore: очки должны увеличиваться', () => {
        const stats = new GameStats();
        stats.addScore(10);
        expect(stats.score).toBe(10);
    });

    test('takeDamage: жизни должны уменьшаться', () => {
        const stats = new GameStats(3);
        stats.takeDamage();
        expect(stats.lives).toBe(2);
    });

    test('isGameOver: должно возвращать true, если жизни кончились', () => {
        const stats = new GameStats(1);
        stats.takeDamage();
        expect(stats.isGameOver).toBe(true);
    });

    test('resetScore: счет должен обнуляться', () => {
        const stats = new GameStats();
        stats.addScore(5);
        stats.resetScore();
        expect(stats.score).toBe(0);
    });
});