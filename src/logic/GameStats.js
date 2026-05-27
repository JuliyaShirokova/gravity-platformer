// src/logic/GameStats.js
export class GameStats {
    constructor(initialLives = 3) {
        this.score = 0;
        this.lives = initialLives;
    }

    addScore(amount = 1) {
        this.score += amount;
    }

    takeDamage() {
        if (this.lives > 0) {
            this.lives -= 1;
        }
        return this.lives;
    }

    resetScore() {
        this.score = 0;
    }

    get isGameOver() {
        return this.lives <= 0;
    }
}