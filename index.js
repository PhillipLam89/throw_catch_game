let state = {}

const canvas = document.getElementById('game')
canvas.width = innerWidth
canvas.height = innerHeight
const ctx = canvas.getContext('2d')

// window.onresize = () => {
//   canvas.width = innerWidth
// canvas.height = innerHeight

// }

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
    generateBackgroundBuildingCoords(i)
  }
  for (let i = 0; i < 8; i++) {
    generateBuildingCoords(i)
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

function generateBackgroundBuildingCoords(index) {
  const prevBldg = state.backgroundBuildings[index - 1]
  const x = prevBldg ? 
            prevBldg.x + prevBldg.width + 4 :
            -30
  const minWidth = 60
  const maxWidth = 110
  const width = minWidth + Math.random() * (maxWidth-minWidth)

  const minHeight = 80
  const maxHeight = 350
  const height = minHeight + Math.random()*(maxHeight-minHeight)

  state.backgroundBuildings.push({x,width,height})
}
function generateBuildingCoords(){}
function initBombPosition(){}

function drawBackground(){
  const gradient = ctx.createLinearGradient(0,0,0,window.innerHeight)
  gradient.addColorStop(1,'#F8BA85')
  gradient.addColorStop(0,'#FFC28E')

  //draw sky
  ctx.fillStyle = gradient
  ctx.fillRect(0,0,innerWidth,innerHeight)

  //Draw moon as circle
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(300,350, 60,0, 2*Math.PI)
  ctx.fill()
}

function drawBackgroundBuildings(){
  state.backgroundBuildings.forEach(bldg => {

    const randomColor = "#000000".replaceAll('0',() =>  (~~(Math.random()*16)).toString(16))
     ctx.fillStyle = randomColor
     ctx.fillRect(bldg.x, 0, bldg.width, bldg.height)
  });
}
function drawBuildings(){}
function drawGorilla(playerNumber) {}
function drawBomb() {}