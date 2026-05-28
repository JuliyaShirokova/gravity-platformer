jest.mock('phaser', () => ({}));

import CollisionManager from '../src/systems/CollisionManager';

describe('CollisionManager', () => {
    let mockScene;
    let mockPlayer;
    let mockEnemy;
    let collisionManager;
    let registeredOverlapCallback;

    beforeEach(() => {
        registeredOverlapCallback = null;

        mockScene = {
            physics: {
                add: {
                    overlap: jest.fn((obj1, obj2, callback) => {
                        registeredOverlapCallback = callback;
                    })
                }
            }
        };

        // Инициализируем объекты с базовыми значениями
        mockPlayer = { sprite: { y: 100, body: { velocity: { y: 0 } } } };
        mockEnemy = { sprite: { y: 200 } };

        collisionManager = new CollisionManager(mockScene, mockPlayer, mockEnemy);
    });

    test('initEnemyCollisions должен регистрировать столкновение в Phaser', () => {
        collisionManager.initEnemyCollisions(() => {}, () => {});

        expect(mockScene.physics.add.overlap).toHaveBeenCalledWith(
            mockPlayer.sprite,
            mockEnemy.sprite,
            expect.any(Function)
        );
    });

    test('должен вызывать onStomp, если игрок падает сверху', () => {
        const onStompMock = jest.fn();
        const onDamageMock = jest.fn();
        
        // Падает вниз (velocity.y > 0) и выше врага
        mockPlayer.sprite.body.velocity.y = 100;
        mockPlayer.sprite.y = 100;
        mockEnemy.sprite.y = 200;

        collisionManager.initEnemyCollisions(onStompMock, onDamageMock);
        registeredOverlapCallback();

        expect(onStompMock).toHaveBeenCalledTimes(1);
        expect(onDamageMock).not.toHaveBeenCalled();
    });

    test('должен вызывать onDamage, если игрок врезается сбоку (или летит вверх)', () => {
        const onStompMock = jest.fn();
        const onDamageMock = jest.fn();
        
        // Лететь вверх (velocity.y < 0) - это урон
        mockPlayer.sprite.body.velocity.y = -100;
        mockPlayer.sprite.y = 200;
        mockEnemy.sprite.y = 200;

        collisionManager.initEnemyCollisions(onStompMock, onDamageMock);
        registeredOverlapCallback();

        expect(onDamageMock).toHaveBeenCalledTimes(1);
        expect(onStompMock).not.toHaveBeenCalled();
    });
});