let state = {}

const canvas = document.getElementById('game')
canvas.width = innerWidth
canvas.height = innerHeight

//panel infos
const angle1DOM = document.querySelector('#info-left .angle')
const velocity1DOM = document.querySelector('#info-left .velocity')

const angle2DOM = document.querySelector('#info-right .angle')
const velocity2DOM = document.querySelector('#info-right .velocity')


const ctx = canvas.getContext('2d')
window.onresize = () => {
  canvas.width = innerWidth
  canvas.height = innerHeight
  calculateScale()
  initBombPosition()
  draw()
}

let isDragging = false
let dragStartX = null
let dragStartY = null


bombGrabAreaDOM.onmousedown = (e) => {
  if (state.phase == 'aiming') {
    isDragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY

    document.body.style.curso = 'grabbing'
  }
}

window.onmousemove = (e) => { //notice we put this event listener on window, to handle user dragging OUTSIDE the bomb grab area

  if (isDragging) {
    const deltaX = e.clientX - dragStartX //total change in distance between bomb grab area & left aim
    const deltaY = e.clientY - dragStartY

    state.bomb.velocity.x = -deltaX //we take the  opposite because the bomb will be thrown OPPOsite direction of the drag
    state.bomb.velocity.y = deltaY

    setInfo(deltaX, deltaY)
    draw() // this repaints the gorillas left arm to follow the aiming of the bomb
  }
}

window.onmouseup = () => {
  if (isDragging) {
    isDragging = false  
    document.body.style.cursor = 'default'

    throwBomb()
  }
}

function throwBomb(){}
newGame() 



function newGame() {
  state = {
    phase: "aiming",
    currentPlayer: 1,
    bomb: {
      x: null,
      y: null,
      rotation: 0,
      velocity: {x:0,y:0}
    },
  
    backgroundBuildings: [],
    buildings: [],
    blastHoles: [],
    scale: 1
  }

  //draws BG buildings
  for (let i = 0; i < 11; i++) {
    generateBackgroundBuildingCoords(i)
  }
  for (let i = 0; i < 8; i++) {
    generateBuildingCoords(i)
  }
  calculateScale()
  initBombPosition()

  draw()
}

function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.hypot(deltaX, deltaY)
  const angleInRads = Math.asin(deltaX / hypotenuse) //JS Math only takes angles in rads
  const angleInDegrees = angleInRads / Math.PI * 180  //degrees is useful to display in HTML
 
  if (state.currentPlayer == 1) {
    angle1DOM.innerText = ~~angleInDegrees
    velocity1DOM.innerText = ~~hypotenuse
  } else {
    angle2DOM.innerText = ~~angleInDegrees
    velocity2DOM.innerText = ~~hypotenuse    
  }
}

//note calling newGame also calls draw func

function calculateScale() {
  const lastBldgOBJ = state.buildings.at(-1)
  const totalWidthOfCity = lastBldgOBJ.x + lastBldgOBJ.width + 150

  state.scale = innerWidth / totalWidthOfCity
}

function draw() {
  ctx.save()
  ctx.translate(0, window.innerHeight)
  ctx.scale(1,-1)
  ctx.scale(state.scale,state.scale) // scales will stack, so it works! 

  //draw scenes
  drawBackground()
  drawBackgroundBuildings()
  drawBuildings()
  drawGorilla(1)
  drawGorilla(2)
  drawBomb()

  ctx.restore()

}
function drawGorilla(player) {
  ctx.save()
  const building = player === 1 
  ? state.buildings.at(1) 
  :
  state.buildings.at(-2) //using .at allows us to easily select 2nd last building
  ctx.translate(building.x + building.width / 2, building.height) //moves coord system to the middle of the building to start drawing gorilla

  drawGorillaBody()
  drawGorillaArms(player)
  // drawGorillaLeftArm(player)
  // drawGorillaRightArm(player)
  drawGorillaFace(player)

  ctx.restore()
}
function drawGorillaBody() {
  ctx.fillStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(0,15)
  ctx.lineTo(-7,0)
  ctx.lineTo(-20,0)
  ctx.lineTo(-17,18)
  ctx.lineTo(-20,44)
  ctx.lineTo(-11,77)
  ctx.lineTo(0,84)
  ctx.lineTo(11,77)
  ctx.lineTo(20,44)
  ctx.lineTo(17,18)
  ctx.lineTo(20,0)
  ctx.lineTo(7,0)
  ctx.fill()
  
}

function drawGorillaArms(player) {
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 18
  ctx.beginPath()
 
  ctx.moveTo(-14,50) //left arm

  const isAiming = state.phase === 'aiming'
  const isCelebrating = state.phase == 'celebrating'
  const currentPlayerOne = state.currentPlayer == player

  if (isAiming && currentPlayerOne && player == 1) {
    ctx.quadraticCurveTo(-44,63,-28,107)
  }else if (isCelebrating && currentPlayerOne) {
    ctx.quadraticCurveTo(-44,63,-28,107)
  } else ctx.quadraticCurveTo(-44,45,-28,12)
  ctx.stroke()


  ctx.moveTo(14,50) //right arm
  if (isAiming && state.currentPlayer == 2 && player == 2) {
    ctx.quadraticCurveTo(44,63,28,107)
  }else if (isCelebrating && state.currentPlayer == player) {
    ctx.quadraticCurveTo(44,63,28,107)
  } else ctx.quadraticCurveTo(44,45,28,12)
  ctx.stroke()
}

function drawGorillaFace(player) {
    //face
    ctx.fillStyle= 'white'
    ctx.beginPath()
    ctx.arc(0,63,9,0,2*Math.PI)
    ctx.arc(-3.5,70,4,0,2*Math.PI)
    ctx.moveTo(3.5,70)
    ctx.arc(3.5,70,4,0,2*Math.PI)
    ctx.fill()
    // eyes

    ctx.fillStyle = 'blue'
    ctx.beginPath()
    ctx.arc(-3.5,70,2,0,2*Math.PI)
    ctx.moveTo(3.5,70)
    ctx.arc(3.5,70,2,0,2*Math.PI)
    ctx.fill()
    //nose
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(-3.5,66.5)
    ctx.lineTo(-1.5,65)
    ctx.moveTo(3.5, 66.5)
    ctx.lineTo(1.5,65)
    ctx.stroke()
    
    //mouth
    ctx.beginPath()
    const isCelebrating = 
            state.phase == 'celebrating' &&
            state.currentPlayer == player
    ctx.strokeStyle = isCelebrating ? 'red' : 'purple'
    ctx.lineWidth = 1
  
    
    ctx.arc(0,isCelebrating ? 60 : 57, 2.5,0,Math.PI, isCelebrating ? true : false)
    // ctx.quadraticCurveTo(0,60,10,50)
  
    ctx.stroke()
}

function generateBackgroundBuildingCoords(index) {
  //background bldgs are painted BEFORE main buildings AND have NO windows
  const prevBldg = state.backgroundBuildings[index - 1]
  const x = prevBldg ? 
            prevBldg.x + prevBldg.width + 4 :
            -30
  const minWidth = 60
  const maxWidth = 110
  const width = minWidth + Math.random() * (maxWidth-minWidth)

  const minHeight = 60
  const maxHeight = 280
  const height = minHeight + Math.random()*(maxHeight-minHeight)

  state.backgroundBuildings.push({x,width,height})
}
function generateBuildingCoords(index){
  const prevBldg = state.buildings[index - 1]
  const x = prevBldg ? 
            prevBldg.x + prevBldg.width + 4 :
            0
  const minWidth = 80
  const maxWidth = 130
  const width = minWidth + Math.random() * (maxWidth-minWidth)

  const gorillaStandsOnThisBldg = index === 1 || index === 6

  const minHeight = 45
  const maxHeight = 300
  const minHeightGorilla = 30
  const maxHeightGorilla = 150

  const height =  gorillaStandsOnThisBldg 
                  ? 
                  minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla) 
                  :
                  minHeight + Math.random() * (maxHeight - minHeight)

    const lightsOn = Array(50).fill('').map(bool => Math.random() <= 0.33 ? true : false)

  state.buildings.push({x,width,height, lightsOn})
}


function drawBackground(){
  const gradient = ctx.createLinearGradient(0,0,0,window.innerHeight)
  gradient.addColorStop(1,'#F8BA85')
  gradient.addColorStop(0,'#FFC28E')

  //draw sky
  ctx.fillStyle = gradient
  ctx.fillRect(0,0,innerWidth / state.scale , innerHeight / state.scale)

  //Draw moon as circle
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.beginPath()
  ctx.arc(canvas.width * .25,canvas.height * .75, 60,0, 2*Math.PI)
  ctx.fill()
}

function drawBackgroundBuildings(){
  state.backgroundBuildings.forEach(bldg => {

    const randomColor = "#000000".replaceAll(0,() =>  (~~(Math.random()*16)).toString(16))
     ctx.fillStyle = 'grey'
     ctx.fillRect(bldg.x, 0, bldg.width, bldg.height)
  });
}
function drawBuildings(){
  state.buildings.forEach(bldg => {  
     ctx.fillStyle = "#4A3C68"
     ctx.fillRect(bldg.x, 0, bldg.width, bldg.height)

     //handle windows drawing
     const windowWidth = 10
     const windowHeight = 12
     const gap = 15
     // we can figure out how many floors & rooms each random building has below
     const numberOfFloors = Math.ceil(bldg.height - gap / (windowHeight + gap) ) //this caculates how TALL a bldg is then divided by the height of the room (windowHeight + gap) to get the # of floors
     const numberOfRoomsPerFloor = Math.floor( (bldg.width - gap) / (windowWidth + gap))


     for (let floor = 0; floor < numberOfFloors; floor++) {
      for (let room = 0; room < numberOfRoomsPerFloor; room++) {
          if (bldg.lightsOn[floor * numberOfRoomsPerFloor + room]) {
            ctx.save()
            ctx.translate(bldg.x + gap, bldg.height - gap)
            ctx.scale(1,-1)

            const x = room * (windowWidth + gap)
            const y = floor * (windowHeight + gap)

            ctx.fillStyle = 'white'
            ctx.fillRect(x,y,windowWidth,windowHeight)

            ctx.restore()
          }
      }  
     }

  });  
}
function initBombPosition(){
  const building = //determines whose turn it is to draw the bomb
    state.currentPlayer == 1
    ? state.buildings.at(1)
    : state.buildings.at(-2)

    const gorillaX = building.x + building.width / 2
    const gorillaY = building.height

    const gorillaHandOffsetX = state.currentPlayer == 1 ? -28 : 28
    const gorillaHandOffsetY = 107

    state.bomb.x = gorillaX + gorillaHandOffsetX
    state.bomb.y = gorillaY + gorillaHandOffsetY

    state.bomb.velocity.x = 0
    state.bomb.velocity.y = 0

    //move the HTML bomb grab area to proper position
    const grabAreaRadius = 15
    const left = state.bomb.x * state.scale - grabAreaRadius
    const bottom = state.bomb.y * state.scale - grabAreaRadius

    bombGrabAreaDOM.style.left = `${left}px`
    bombGrabAreaDOM.style.bottom = `${bottom}px`
}
function drawBomb() {
  ctx.save()
  ctx.translate(state.bomb.x, state.bomb.y) // moves 0,0 coordinates to the gorillas hand that is holding the bomb

  //draw bomb as cirfcle
  ctx.fillStyle = 'aqua'
  ctx.beginPath()
  ctx.arc(3,7,8,0,2*Math.PI)
  ctx.fill()
  ctx.restore()
}