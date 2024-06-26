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

    document.body.style.cursor = 'grabbing'



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

let previousAnimationTimeStamp = null

function throwBomb(){
  state.phase = 'in flight'
  previousAnimationTimeStamp = null
  requestAnimationFrame(animate)
}

function moveBomb(elapsedTime) {
  const multiplier = elapsedTime / 200

  //adjust for gravity

  state.bomb.velocity.y -= 20 * multiplier

  //calculates new position
  state.bomb.x+= state.bomb.velocity.x * multiplier
  state.bomb.y+= state.bomb.velocity.y * multiplier

  const direction = state.currentPlayer == 1 ? -1 : 1
  state.bomb.rotation+= direction * multiplier * 5
}

function animate(timeStamp) {
  if (previousAnimationTimeStamp == null) { // this is for the 1st cycle since timeStamp would be null
    previousAnimationTimeStamp = timeStamp
    requestAnimationFrame(animate)
    return
  }
  const elapsedTime = timeStamp - previousAnimationTimeStamp
  moveBomb(elapsedTime)

  //hit detection

  const miss = checkFrameHit() || false
  const hit = false

  if (miss) { //handles case when we hit a bldg or bomb flies off-screen
    state.currentPlayer = state.currentPlayer == 1 ? 2 : 1
    state.phase = 'aiming'
    initBombPosition()

    draw()
    return
  }
  if (hit) {
    //blah blah
    return
  }
  draw()
  //continue animation
  previousAnimationTimeStamp = timeStamp
  requestAnimationFrame(animate)
}

function checkFrameHit() {
  //stops throw animation if bomb gets out of bounds

  const isOutOfBounds = (state.bomb.y < 0 || state.bomb.x < 0 || state.bomb.x > innerWidth / state.scale)
  //notice we dont check if bomb is out of screen VERTICALLY UPWARDS, since gravity will force it back down
  if (isOutOfBounds) return true
}

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

  const isAiming = state.phase == 'aiming'
  const isCelebrating = state.phase == 'celebrating'
  const currentPlayerOne = state.currentPlayer == player

  if (isAiming && currentPlayerOne && player == 1) {
    
    ctx.quadraticCurveTo(-44,63,-28 - state.bomb.velocity.x / 6.25,107 - state.bomb.velocity.y / 6.25)
  }else if (isCelebrating && currentPlayerOne) {
    ctx.quadraticCurveTo(-44,63,-28,107)
  } else ctx.quadraticCurveTo(-44,45,-28,12)
  ctx.stroke()


  ctx.moveTo(14,50) //right arm
  if (isAiming && state.currentPlayer == 2 && player == 2) {
    ctx.quadraticCurveTo(44,63,28 - state.bomb.velocity.x / 6.25,107 - state.bomb.velocity.y / 6.25)
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
  ctx.arc(canvas.width * .15,canvas.height * .65, 60,0, 2*Math.PI)
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
    state.bomb.rotation = 0 //reset state of bomb rotation back to default

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

  if (state.phase == 'aiming') {
    ctx.translate(-state.bomb.velocity.x / 6.25, -state.bomb.velocity.y / 6.25) 
    //draws bomb preview trajectory as dotted line when aiming
    ctx.strokeStyle = 'white'
    ctx.setLineDash([3,8])
    ctx.lineWidth = 3
    var bombRadius = 8
    ctx.beginPath()
    ctx.moveTo(0,bombRadius * 0.5) //4 is half of the bomb's radius so it starts in middle
    ctx.lineTo(state.bomb.velocity.x, state.bomb.velocity.y)
    ctx.stroke()

      //draw bomb as circle
    ctx.fillStyle = 'white'
    ctx.rotate(state.bomb.rotation)
    ctx.beginPath()
    ctx.arc(3,7,bombRadius,0,2*Math.PI)
    ctx.fill()

  } else if (state.phase == 'in flight') {
    //code below draws rotating half-circle bomb animation
      ctx.fillStyle = 'red'
      ctx.rotate(state.bomb.rotation)
      ctx.beginPath()
      ctx.moveTo(-8,-2)
      ctx.quadraticCurveTo(0,12,8,-2)
      ctx.quadraticCurveTo(0,22,-8,-2)
      ctx.fill()
  } else {
    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(3,7,bombRadius,0,2*Math.PI)
  }
   //restores our translate
  ctx.restore()
}