let state = {}

const canvas = document.getElementById('game')
canvas.width = innerWidth
canvas.height = innerHeight
const ctx = canvas.getContext('2d')

newGame() 

function newGame() {
  state = {
    phase: "celebrating",
    currentPlayer: 1,
    bomb: {
      x: null,
      y: null,
      rotation: 0,
      velocity: {x:0,y:0}
    },
  
    backgroundBuildings: [],
    buildings: [],
    blastHoles: []
  }

  //draws BG buildings
  for (let i = 0; i < 11; i++) {
    generateBackgroundBuilding(i)
  }
  for (let i = 0; i < 8; i++) {
    generateBuilding(i)
  }

  initBombPosition()

  draw()
}

function draw() {
  ctx.save()
  ctx.translate(0, window.innerHeight)
  ctx.scale(1,-1)

  //draw scenes
  drawBackground()
  drawBackgroundBuildings()
  drawBuildings()
  drawGorilla(1)
  drawGorilla(2)
  drawBomb()

  ctx.restore()
}

function generateBackgroundBuilding() {}
function generateBuilding(){}
function initBombPosition(){}
function drawBackground(){}
function drawBackgroundBuildings(){}
function drawBuildings(){}
function drawGorilla(playerNumber) {}
function drawBomb() {}