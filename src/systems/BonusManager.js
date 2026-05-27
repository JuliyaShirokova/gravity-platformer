export default class BonusManager {
    constructor(scene, player, enemy) {
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;
        
        this.bonuses = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        this.activeIcons = {
            burger: null,
            icecream: null
        };
    }

    spawn(type, x, y) {
        const bonus = this.bonuses.create(x, y, type);
        bonus.type = type;
        if (bonus.body) bonus.body.allowGravity = false;
        return bonus;
    }

    handleCollection(player, bonus) {
        bonus.destroy();
        
        if (bonus.type === 'burger') {
            this.applyBurgerEffect();
        } else if (bonus.type === 'icecream') {
            this.applyIceCreamEffect();
        }
    }

    _showIcon(type, x) {
        if (this.activeIcons[type]) {
            this.activeIcons[type].destroy();
        }
        this.activeIcons[type] = this.scene.add.image(x, 15, type)
            .setScrollFactor(0)
            .setScale(1.2); 
    }

    _hideIcon(type) {
        if (this.activeIcons[type]) {
            this.activeIcons[type].destroy();
            this.activeIcons[type] = null;
        }
    }

    applyBurgerEffect() {
        this._showIcon('burger', 650);
        
        this.player.speedMultiplier = 2;
        this.player.jumpMultiplier = 2;
        
        this.scene.time.delayedCall(5000, () => {
            this.player.speedMultiplier = 1;
            this.player.jumpMultiplier = 1;
            this._hideIcon('burger');
        });
    }

    applyIceCreamEffect() {
        this._showIcon('icecream', 690);
        
        this.player.hasIceCream = true;
        
        // Время действия уменьшено до 5 секунд
        this.scene.time.delayedCall(5000, () => {
            this.player.hasIceCream = false;
            this._hideIcon('icecream');
        });
    }

    tryFreezeEnemy() {
        if (this.player.hasIceCream) {
            this.enemy.freeze(3000); // Замораживаем врага
            this.player.hasIceCream = false; // "Съедаем" бонус при столкновении
            this._hideIcon('icecream'); // Иконка пропадает
        }
    }
}