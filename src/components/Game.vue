<template>
  <div class="game-wrapper">
    <div class="game-container">
      <header class="game-header">
        <h1>Vue Snake Adventure</h1>
      </header>
      <div class="game-area">
        <GridComponent
          :grid-size="gridSize"
          :snake-body="snake.body"
          :food-position="food"
          :obstacles="obstacles"
        />
        <div v-if="isGameOver" class="game-over-message">
          <h2>Game Over!</h2>
          <p>Your Score: {{ score }}</p>
        </div>
      </div>
      <div class="controls">
        <div class="score-display">Score: {{ score }}</div>
        <button @click="toggleGamePlay" class="game-button">{{ gameButtonText }}</button>
      </div>
      <div class="instructions">
        <p>Use <strong>Arrow Keys</strong> to move.</p>
        <p>Press <strong>{{ gameButtonText === 'Start Game' || gameButtonText === 'Restart Game' ? 'Start' : 'Pause' }}</strong> button or <strong>Enter/Space</strong> to play/pause.</p>
      </div>
    </div>
  </div>
</template>

<script>
import GridComponent from './Grid.vue';
import { createInitialSnake, moveSnake, checkSelfCollision } from '../gameLogic/Snake.js';

export default {
  name: 'GameComponent',
  components: {
    GridComponent,
  },
  data() {
    return {
      gridSize: 24,
      snake: createInitialSnake(),
      food: { x: -1, y: -1 },
      obstacles: [],
      score: 0,
      gameInterval: null,
      gameSpeed: 150,
      isGameRunning: false,
      isGameOver: false,
      ateFoodThisTurn: false,
      initialObstacleCount: 5,
    };
  },
  computed: {
    gameButtonText() {
      if (this.isGameOver) return 'Restart Game';
      return this.isGameRunning ? 'Pause Game' : 'Start Game';
    }
  },
  methods: {
    toggleGamePlay() {
      if (this.isGameOver) {
        this.resetAndStartGame();
      } else if (this.isGameRunning) {
        this.pauseGame();
      } else {
        this.startGame();
      }
    },
    resetAndStartGame() {
      this.snake = createInitialSnake();
      this.score = 0;
      this.isGameOver = false;
      this.isGameRunning = false;
      this.obstacles = this.generateObstacles(this.initialObstacleCount);
      this.food = this.generateFood();
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      this.startGame();
    },
    startGame() {
      if (this.isGameRunning && !this.isGameOver) return;
      if (!this.isGameRunning) {
        if(this.obstacles.length === 0) this.obstacles = this.generateObstacles(this.initialObstacleCount);
        if(this.food.x === -1) this.food = this.generateFood();
      }
      this.isGameRunning = true;
      this.isGameOver = false;
      // Pass gridSize to CSS variable for Grid.vue, though Grid.vue now also gets it as prop for its own style block
      document.documentElement.style.setProperty('--grid-size-dynamic', this.gridSize);
      if (this.gameInterval) clearInterval(this.gameInterval);
      this.gameInterval = setInterval(this.gameLoop, this.gameSpeed);
    },
    pauseGame() {
      this.isGameRunning = false;
      clearInterval(this.gameInterval);
    },
    gameLoop() {
      if (!this.isGameRunning || this.isGameOver) return;
      this.ateFoodThisTurn = false;
      const snakeHeadOriginal = { ...this.snake.body[0] }; // Position before move

      // Check food consumption based on where head WILL BE
      let nextHead = { ...snakeHeadOriginal };
      const tempDirection = this.snake.nextDirection; // Use the intended direction for food check
      if (tempDirection === 'UP' && this.snake.direction !== 'DOWN') nextHead.y -=1;
      else if (tempDirection === 'DOWN' && this.snake.direction !== 'UP') nextHead.y +=1;
      else if (tempDirection === 'LEFT' && this.snake.direction !== 'RIGHT') nextHead.x -=1;
      else if (tempDirection === 'RIGHT' && this.snake.direction !== 'LEFT') nextHead.x +=1;
      else { // if no valid nextDirection, use current direction
          switch(this.snake.direction) {
              case 'UP': nextHead.y -=1; break;
              case 'DOWN': nextHead.y +=1; break;
              case 'LEFT': nextHead.x -=1; break;
              case 'RIGHT': nextHead.x +=1; break;
          }
      }
       // Apply wall wrapping to nextHead for accurate food check at edges
      if (nextHead.x < 0) nextHead.x = this.gridSize - 1;
      else if (nextHead.x >= this.gridSize) nextHead.x = 0;
      if (nextHead.y < 0) nextHead.y = this.gridSize - 1;
      else if (nextHead.y >= this.gridSize) nextHead.y = 0;


      if (this.food && nextHead.x === this.food.x && nextHead.y === this.food.y) {
        this.ateFoodThisTurn = true;
        this.score += 10;
      }

      this.snake = moveSnake(this.snake, this.gridSize, this.ateFoodThisTurn);

      if (this.ateFoodThisTurn) {
          this.food = this.generateFood();
      }

      if (checkSelfCollision(this.snake.body)) {
        this.endGame('Oops! You ran into yourself.');
        return;
      }
      if (this.checkObstacleCollision(this.snake.body[0])) {
        this.endGame('Ouch! Hit an obstacle.');
        return;
      }
    },
    endGame(reason = 'Game Over') {
      this.isGameOver = true;
      this.isGameRunning = false;
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
      console.log(reason, 'Score:', this.score);
    },
    checkObstacleCollision(snakeHead) {
      return this.obstacles.some(obstacle => obstacle.x === snakeHead.x && obstacle.y === snakeHead.y);
    },
    generateSafeRandomPosition(existingItems = []) {
        let position;
        let isSafe;
        const allForbiddenSpots = [...this.snake.body, ...existingItems];
        // Add current food to forbidden spots only if we are NOT generating food itself
        // This check is a bit tricky, simpler to let food be overwritten if it's being regenerated
        // For obstacle generation, food location should be forbidden.
        // For food generation, its old location is fine to be picked.

        // A simpler approach for generateSafeRandomPosition:
        // It just needs to avoid snake and the 'existingItems' passed to it.
        // The caller (generateFood, generateObstacles) is responsible for passing the correct 'existingItems'.

        do {
            isSafe = true;
            position = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize),
            };

            if (this.snake.body.some(spot => spot.x === position.x && spot.y === position.y)) {
                isSafe = false;
                continue;
            }
            if (existingItems.some(spot => spot.x === position.x && spot.y === position.y)) {
                isSafe = false;
                continue;
            }
        } while (!isSafe);
        return position;
    },
    generateFood() {
        // Food should not spawn on snake or obstacles.
        return this.generateSafeRandomPosition(this.obstacles);
    },
    generateObstacles(count) {
        const newObstacles = [];
        let tempForbiddenForObstacles = []; // Start with nothing forbidden other than snake (handled by generateSafeRandomPosition)
        if (this.food && this.food.x !== -1) { // Add current food position to things obstacles cannot spawn on
            tempForbiddenForObstacles.push(this.food);
        }

        for (let i = 0; i < count; i++) {
            const newObstacle = this.generateSafeRandomPosition([...tempForbiddenForObstacles, ...newObstacles]);
            newObstacles.push(newObstacle);
        }
        return newObstacles;
    },
    handleKeydown(event) {
      if ((event.key === 'Enter' || event.key === ' ') && (!this.isGameRunning || this.isGameOver)) {
         this.toggleGamePlay();
         event.preventDefault();
         return;
      }
      if (!this.isGameRunning) return;
      const key = event.key;
      if (key === 'ArrowUp') this.snake.nextDirection = 'UP';
      else if (key === 'ArrowDown') this.snake.nextDirection = 'DOWN';
      else if (key === 'ArrowLeft') this.snake.nextDirection = 'LEFT';
      else if (key === 'ArrowRight') this.snake.nextDirection = 'RIGHT';
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown);
    document.documentElement.style.setProperty('--grid-size-dynamic', this.gridSize); // For Grid.vue :root
    this.resetAndStartGame();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
  }
};
</script>

<style> /* Global styles can go here or in App.vue, or be scoped */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #e8eff1; /* Light grayish blue background */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align to top for longer content */
  min-height: 100vh;
  padding-top: 20px; /* Add some padding at the top */
}

#app { /* Assuming your root Vue instance is #app */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>

<style scoped>
.game-wrapper { /* New wrapper for overall centering and potential max-width */
  display: flex;
  justify-content: center;
  padding: 20px;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff; /* White background for the game box */
  padding: 25px;
  border-radius: 12px; /* More rounded corners */
  box-shadow: 0 8px 16px rgba(0,0,0,0.15); /* Softer, deeper shadow */
  width: auto; /* Fit content */
  max-width: 600px; /* Max width for larger screens */
}

.game-header {
  margin-bottom: 20px;
  color: #2c3e50; /* Dark blue-gray text */
}

.game-header h1 {
  font-size: 2.2em;
  font-weight: 600;
  margin: 0;
}

.game-area {
  position: relative;
  margin-bottom: 20px; /* Space between grid and controls */
  /* Border is now on GridComponent's .grid-container */
}

.game-over-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(44, 62, 80, 0.9); /* Darker, slightly transparent */
  color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  z-index: 100;
}

.game-over-message h2 {
  font-size: 2em;
  margin-top: 0;
  margin-bottom: 10px;
}

.game-over-message p {
  font-size: 1.4em;
  margin-bottom: 0;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%; /* Ensure controls take up width for centering score/button */
}

.score-display {
  font-size: 1.8em; /* Larger score */
  color: #34495e; /* Slightly different dark blue-gray */
  font-weight: bold;
  margin-bottom: 15px;
}

.game-button { /* More specific selector for the button */
  padding: 12px 30px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  background-color: #3498db; /* Blue */
  color: white;
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin-bottom: 15px;
}

.game-button:hover {
  background-color: #2980b9; /* Darker blue */
}

.game-button:active {
  transform: translateY(1px); /* Slight press effect */
}

.instructions {
  margin-top: 10px;
  font-size: 0.95em;
  color: #7f8c8d; /* Gray */
  text-align: center;
}

.instructions p {
  margin: 5px 0;
}

.instructions strong {
  color: #34495e; /* Darker text for emphasis */
}
</style>
