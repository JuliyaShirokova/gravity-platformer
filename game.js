import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './src/data/constants.js';
import GameScene from './src/scenes/GameScene.js';
import UIScene from './src/scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: GRAVITY }, debug: true }
  },
  
  scene: [GameScene, UIScene] 
};

const game = new Phaser.Game(config);