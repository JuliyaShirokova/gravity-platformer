export default class BonusManager {
    constructor(scene, player, enemy) {
        this.scene = scene;
        this.player = player;
        this.enemy = enemy;
        
        this.bonuses = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        
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

    applyBurgerEffect() {
        // Устанавливаем множители
        this.player.speedMultiplier = 2;
        this.player.jumpMultiplier = 2;
        
        // Таймер на выключение бонуса
        this.scene.time.delayedCall(5000, () => {
            this.player.speedMultiplier = 1;
            this.player.jumpMultiplier = 1;
            // Больше не нужно вызывать _hideIcon, 
            // UIScene сама увидит, что множитель стал 1, и скроет иконку!
        });
    }

    applyIceCreamEffect() {
        this.player.hasIceCream = true;
        
        this.scene.time.delayedCall(5000, () => {
            this.player.hasIceCream = false;
            // UIScene сама увидит, что hasIceCream стал false, и скроет иконку
        });
    }

    tryFreezeEnemy() {
        if (this.player.hasIceCream) {
            this.enemy.freeze(3000); // Замораживаем врага
            this.player.hasIceCream = false; // "Съедаем" бонус при столкновении
        }
    }
}