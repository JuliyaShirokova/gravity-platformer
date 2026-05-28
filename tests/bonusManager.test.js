import BonusManager from '../src/systems/BonusManager';

describe('BonusManager', () => {
    let mockScene;
    let mockPlayer;
    let mockEnemy;
    let bonusManager;
    let timerCallback;
    let mockGroup;

    beforeEach(() => {
        timerCallback = null;
        
        // Создаем мок группы физики
        mockGroup = { create: jest.fn() };

        mockScene = {
            time: { 
                delayedCall: jest.fn((delay, callback) => { timerCallback = callback; }) 
            },
            physics: { 
                add: { 
                    group: jest.fn(() => mockGroup) 
                } 
            }
        };
        
        mockPlayer = { speedMultiplier: 1, jumpMultiplier: 1, hasIceCream: false };
        mockEnemy = { freeze: jest.fn() };

        bonusManager = new BonusManager(mockScene, mockPlayer, mockEnemy);
    });

    // --- Основные тесты ---

    test('бургер должен увеличивать скорость и прыжок игрока', () => {
        const mockBonus = { type: 'burger', destroy: jest.fn() };
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        expect(mockPlayer.speedMultiplier).toBe(2);
        expect(mockPlayer.jumpMultiplier).toBe(2);
        expect(mockBonus.destroy).toHaveBeenCalled();
    });

    test('эффект бургера должен заканчиваться через 5 секунд', () => {
        const mockBonus = { type: 'burger', destroy: jest.fn() };
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        if (timerCallback) timerCallback();
        
        expect(mockPlayer.speedMultiplier).toBe(1);
        expect(mockPlayer.jumpMultiplier).toBe(1);
    });

    test('мороженое должно активировать флаг неуязвимости', () => {
        const mockBonus = { type: 'icecream', destroy: jest.fn() };
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        expect(mockPlayer.hasIceCream).toBe(true);
    });

    test('мороженое должно замораживать врага и сбрасываться', () => {
        mockPlayer.hasIceCream = true;
        bonusManager.tryFreezeEnemy();
        
        expect(mockEnemy.freeze).toHaveBeenCalledWith(3000);
        expect(mockPlayer.hasIceCream).toBe(false);
    });

    // --- Новые негативные и дополнительные тесты ---

    test('tryFreezeEnemy не должен замораживать, если нет мороженого', () => {
        mockPlayer.hasIceCream = false;
        bonusManager.tryFreezeEnemy();
        
        expect(mockEnemy.freeze).not.toHaveBeenCalled();
    });

    test('handleCollection не должен падать при неизвестном типе бонуса', () => {
        const mockBonus = { type: 'unknown_item', destroy: jest.fn() };
        
        // Обернем в функцию, чтобы проверить отсутствие ошибок
        expect(() => {
            bonusManager.handleCollection(mockPlayer, mockBonus);
        }).not.toThrow();
        
        expect(mockBonus.destroy).toHaveBeenCalled();
    });

    test('spawn должен создавать объект в физической группе', () => {
        const mockCreatedBonus = { body: { allowGravity: true } };
        mockGroup.create.mockReturnValue(mockCreatedBonus);
        
        const result = bonusManager.spawn('burger', 100, 200);
        
        expect(mockGroup.create).toHaveBeenCalledWith(100, 200, 'burger');
        expect(result.type).toBe('burger');
        expect(result.body.allowGravity).toBe(false); // Проверка, что гравитация выключена
    });
});