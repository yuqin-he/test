export function createInitialSnake() {
  return {
    body: [
      { x: 10, y: 10 }, // Head
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
  };
}

export function moveSnake(snake, gridSize, ateFood) {
  let newHead = { ...snake.body[0] }; // Clone the current head

  // Update direction from buffered input if it's a valid move
  const currentDirection = snake.direction;
  if (snake.nextDirection === 'UP' && currentDirection !== 'DOWN') snake.direction = 'UP';
  else if (snake.nextDirection === 'DOWN' && currentDirection !== 'UP') snake.direction = 'DOWN';
  else if (snake.nextDirection === 'LEFT' && currentDirection !== 'RIGHT') snake.direction = 'LEFT';
  else if (snake.nextDirection === 'RIGHT' && currentDirection !== 'LEFT') snake.direction = 'RIGHT';
  // else, keep current direction if nextDirection is invalid (e.g. trying to reverse)


  switch (snake.direction) {
    case 'UP':
      newHead.y -= 1;
      break;
    case 'DOWN':
      newHead.y += 1;
      break;
    case 'LEFT':
      newHead.x -= 1;
      break;
    case 'RIGHT':
      newHead.x += 1;
      break;
  }

  // Wall Wrapping
  if (newHead.x < 0) newHead.x = gridSize - 1;
  else if (newHead.x >= gridSize) newHead.x = 0;
  else if (newHead.y < 0) newHead.y = gridSize - 1;
  else if (newHead.y >= gridSize) newHead.y = 0;

  snake.body.unshift(newHead);

  if (!ateFood) {
    snake.body.pop(); // Remove tail only if no food was eaten
  }

  return snake; // Return the modified snake object
}

export function checkSelfCollision(snakeBody) {
  if (snakeBody.length <= 1) return false; // No collision if snake is too short
  const head = snakeBody[0];
  for (let i = 1; i < snakeBody.length; i++) {
    if (snakeBody[i].x === head.x && snakeBody[i].y === head.y) {
      return true; // Collision detected
    }
  }
  return false;
}
