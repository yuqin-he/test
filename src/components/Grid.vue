<template>
  <div class="grid-container" :style="{ '--grid-size-dynamic': gridSize }">
    <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="grid-row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        class="grid-cell"
        :class="{
          'snake-cell': isSnakeCell(rowIndex, colIndex),
          'snake-head-cell': isSnakeHead(rowIndex, colIndex),
          'food-cell': isFoodCell(rowIndex, colIndex),
          'obstacle-cell': isObstacleCell(rowIndex, colIndex),
          'even-cell': (rowIndex + colIndex) % 2 === 0 && !isSnakeCell(rowIndex, colIndex) && !isFoodCell(rowIndex, colIndex) && !isObstacleCell(rowIndex, colIndex),
          'odd-cell': (rowIndex + colIndex) % 2 !== 0 && !isSnakeCell(rowIndex, colIndex) && !isFoodCell(rowIndex, colIndex) && !isObstacleCell(rowIndex, colIndex)
        }"
      >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridComponent',
  props: {
    gridSize: {
      type: Number,
      required: true,
      default: 24,
    },
    snakeBody: {
      type: Array,
      required: true,
      default: () => [],
    },
    foodPosition: {
      type: Object,
      default: null,
    },
    obstacles: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    grid() {
      const grid = [];
      for (let i = 0; i < this.gridSize; i++) {
        grid.push(new Array(this.gridSize).fill(0));
      }
      return grid;
    },
  },
  methods: {
    isSnakeCell(row, col) {
      return this.snakeBody.some(segment => segment.x === col && segment.y === row);
    },
    isSnakeHead(row, col) {
      if (this.snakeBody.length === 0) return false;
      return this.snakeBody[0].x === col && this.snakeBody[0].y === row;
    },
    isFoodCell(row, col) {
      return this.foodPosition && this.foodPosition.x === col && this.foodPosition.y === row;
    },
    isObstacleCell(row, col) {
      return this.obstacles.some(obstacle => obstacle.x === col && obstacle.y === row);
    }
  }
};
</script>

<style scoped>
:root {
  --cell-size: 20px; /* Define cell size for consistency */
}

.grid-container {
  display: grid;
  /* Use CSS variable passed from Game.vue for dynamic grid sizing if ever needed, but keep fixed for 24x24 */
  grid-template-rows: repeat(var(--grid-size-dynamic, 24), var(--cell-size));
  grid-template-columns: repeat(var(--grid-size-dynamic, 24), var(--cell-size));
  border: 2px solid #333; /* Thicker border for the grid */
  width: calc(var(--grid-size-dynamic, 24) * var(--cell-size));
  height: calc(var(--grid-size-dynamic, 24) * var(--cell-size));
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2); /* Add some depth */
  background-color: #e0e0e0; /* Fallback, cells will cover this */
}

.grid-row {
  display: contents;
}

.grid-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  box-sizing: border-box;
  /* Default empty cell - subtle checkerboard */
}

.even-cell {
  background-color: #f8f8f8;
}

.odd-cell {
  background-color: #f0f0f0;
}

.snake-cell {
  background-color: #38a169; /* A slightly different green */
  border-radius: 3px; /* Slightly rounded segments */
  /* box-shadow: inset 0 0 2px rgba(0,0,0,0.3); */
}

.snake-head-cell {
  background-color: #2c7a50; /* Darker green for the head */
  border-radius: 4px 4px 2px 2px; /* Shape the head a bit */
}

.food-cell {
  background-color: #e53e3e; /* A slightly different red */
  border-radius: 50%; /* Make food circular */
  /* Add a small dot in the middle or a shine effect if desired */
  background-image: radial-gradient(circle at 65% 15%, white 1px, rgba(255,255,255,0.3) 2px, transparent 8px);
}

.obstacle-cell {
  background-color: #4a5568; /* A bit softer dark grey/blue */
  border-radius: 2px;
  /* Maybe a texture or pattern for obstacles */
  background-image: repeating-linear-gradient(
    45deg,
    #2d3748,
    #2d3748 3px,
    #4a5568 3px,
    #4a5568 6px
  );
}
</style>
