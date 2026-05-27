import BonusManager from '../src/systems/BonusManager';

describe('BonusManager', () => {
    let mockScene;
    let mockPlayer;
    let mockEnemy;
    let bonusManager;
    let timerCallback; // Сюда мы сохраним функцию таймера

    beforeEach(() => {
        timerCallback = null; // Сбрасываем таймер перед каждым тестом

        mockScene = {
            // Теперь таймер просто запоминает функцию, не выполняя её сразу
            time: { delayedCall: jest.fn((delay, callback) => { timerCallback = callback; }) },
            physics: { add: { group: jest.fn(() => ({ create: jest.fn() })) } },
            add: { image: jest.fn(() => ({ 
                destroy: jest.fn(), 
                setScrollFactor: jest.fn().mockReturnThis(), 
                setScale: jest.fn().mockReturnThis() 
            })) }
        };
        
        mockPlayer = { speedMultiplier: 1, jumpMultiplier: 1, hasIceCream: false };
        mockEnemy = { freeze: jest.fn() };

        bonusManager = new BonusManager(mockScene, mockPlayer, mockEnemy);
    });

    test('бургер должен увеличивать скорость и прыжок игрока', () => {
        const mockBonus = { type: 'burger', destroy: jest.fn() };
        
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        // Теперь здесь будет 2, потому что таймер еще не сработал
        expect(mockPlayer.speedMultiplier).toBe(2);
        expect(mockPlayer.jumpMultiplier).toBe(2);
    });

    test('эффект бургера должен заканчиваться через 5 секунд', () => {
        const mockBonus = { type: 'burger', destroy: jest.fn() };
        
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        // Вручную запускаем таймер (симулируем истечение 5 секунд)
        if (timerCallback) timerCallback();
        
        expect(mockPlayer.speedMultiplier).toBe(1);
        expect(mockPlayer.jumpMultiplier).toBe(1);
    });

    test('мороженое должно активировать флаг неуязвимости', () => {
        const mockBonus = { type: 'icecream', destroy: jest.fn() };
        
        bonusManager.handleCollection(mockPlayer, mockBonus);
        
        // Теперь здесь будет true
        expect(mockPlayer.hasIceCream).toBe(true);
    });

    test('мороженое должно замораживать врага и сбрасываться', () => {
        // Активируем эффект
        mockPlayer.hasIceCream = true;
        
        bonusManager.tryFreezeEnemy();
        
        expect(mockEnemy.freeze).toHaveBeenCalledWith(3000);
        expect(mockPlayer.hasIceCream).toBe(false);
    });
});