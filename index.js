const d = document
const ROOT = d.getElementById('root')

/**
 * @param {number[][]} frame 
 */
function printFrame(frame) {
  const htmlArray = ['<div class="container">']

  for (const row of frame) {
    htmlArray.push('<div class="row">')
    for (const pixel of row) {
      htmlArray.push(`<div class="pixel">${pixel}</div>`)
    }
    htmlArray.push('</div>')
  }
  htmlArray.push('</div>')

  const htmlString = htmlArray.join('')

  ROOT.innerHTML = htmlString
}

function iterateAllArray(array) {
  const [first, ...rest] = array

  printFrame(first)

  if (rest.length > 0) requestAnimationFrame(() => iterateAllArray(rest))
}

(async function() {
  const badApple = await fetch('/badApple.json').then(r => r.json())

  iterateAllArray(badApple.data)
})()