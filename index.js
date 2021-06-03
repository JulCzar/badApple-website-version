const d = document
const ROOT = d.getElementById('root')

const FRAMERATE = 36;

const canvas = d.createElement('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 800
canvas.height = 50

/**
 * @param {number[][]} frame 
 */
function printFrame(frame) {
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  const [frameHeight, frameWidth] = [frame.length, frame[0].length]
  const [incrementX, incrementY] = [width/frameWidth, height/frameHeight]
  for (const [i, row] of Object.entries(frame)) {
    for (const [j, pixel] of Object.entries(row)) {
      const [posX, posY] = [j*incrementX, i*incrementY]
      ctx.fillText(pixel, posX, posY)
    }
  }
}

function iterateAllArray(array) {
  const [first, ...rest] = array

  printFrame(first)

  if (rest.length > 0) setTimeout(() => iterateAllArray(rest), 1000/FRAMERATE)
}

(async function() {
  const badApple = await fetch('/badApple.json').then(r => r.json())

  iterateAllArray(badApple.data)
  ROOT.appendChild(canvas)
})()