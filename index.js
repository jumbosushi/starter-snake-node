const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#DFFF00',
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move

  let dir = getRandomDirection();
  while (!isValidMove(request.body, dir)){
    dir = getRandomDirection();  
  }

  // Response data
  const data = {
    move: dir, // one of: ['up','down','left','right']
  }
  
  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- HELPERS ---
let isValidMove = function(data, move) {
  head = data.you.body[0];
  if (move == "up") {
    head.y -= 1;
  } else if (move == "down") {
    head.y += 1;
  } else if (move == "left") {
    head.x -= 1;
  } else if (move == "right") {
    head.x += 1;
  }
  if (isInBounds(data, head) && !isSnakeCell(data, head)){
    return true;
  } else {
    return false;
  }
}

// checks if given coordinate is in the game board
let isInBounds = function(data, pos) {
  const { height, width } = data.board;
  if (pos.x > 0 || pos.y > 0 || pos.x < width || pos.y < height) {
    return true;
  }
  return false;
}

// checks if given cell is occupied by a snake
let isSnakeCell = function(data, pos) {
  let { board: { snakes } } = data;
  // snakes.push(data.you.body)
  for (let snake of snakes) {
    for (let cell of snake.body) {
      if (cell.x == pos.x && cell.y == pos.y) {
        return true;
      }
    }
  }
  // for (let cell of data.you.body) {
  //   if (cell.x == pos.x && cell.y == pos.y) {
  //     return true;
  //   }
  // }
  return false;
}

// if enemy is closer to given cell
let isEnemyCloser = function(data, cell){
  const heads = getEnemyHeads(data);
  
  const distances = []
  for (let head of heads) {
    let dist = getDist(head, cell)
    distances.push(dist)
  }

  yourDist = getDist(data.you.body[0], cell)
  for (let d of distances){
    if (d < yourDist) {
      return 
    }
  }
}

// get positions of all
let getEnemyHeads = function(data){
  const heads = []
  for (let snake of data.board.snakes) {
    heads.push(snake[0])
  }
  return heads
}

// calc distance between two points
let getDist = function(a, b){
  return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
}

// yolo
function getRandomDirection() {
  const index = Math.floor(Math.random() * Math.floor(4));
  return ["up", "down", "left", "right"][index];
}

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
