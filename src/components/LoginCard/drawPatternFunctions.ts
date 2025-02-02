import theme from '#tailwind-config/theme'
import { getRandomArrayElements } from '~/utils'

type TailwindPrimaryColorKeys = keyof typeof theme.colors['royal-blue']
type PrimaryColor = typeof theme.colors['royal-blue'][TailwindPrimaryColorKeys]

const lighterColors = Object.entries(theme.colors['royal-blue'])
  .filter(([shade]) => {
    const colorNumber = Number(shade)
    return colorNumber > 50 && colorNumber <= 700
  })
  .map<PrimaryColor>(([_, color]) => color)

const rotateCanvasRandomly = (ctx: CanvasRenderingContext2D) => {
  const angle = Math.floor(Math.random() * 4) * (Math.PI / 2) // Random multiple of 90 degrees
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
  ctx.rotate(angle)
  ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2)
}

const drawSplitSquare = (ctx: CanvasRenderingContext2D) => {
  rotateCanvasRandomly(ctx)

  const [color1, color2] = getRandomArrayElements(lighterColors, { numberOfElements: 2, distinct: true })
  const { width, height } = ctx.canvas
  // Draw first half
  ctx.fillStyle = color1
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()

  // Draw second half
  ctx.fillStyle = color2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, height)
  ctx.lineTo(width, 0)
  ctx.closePath()
  ctx.fill()
}

const drawNineCircles = (ctx: CanvasRenderingContext2D) => {
  const [circleColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 2, distinct: true })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  const radius = width / 9
  ctx.fillStyle = circleColor

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * (width / 3) + width / 6
    const y = Math.floor(i / 3) * (height / 3) + height / 6
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawNineSquares = (ctx: CanvasRenderingContext2D) => {
  const squareColors = getRandomArrayElements(lighterColors, { numberOfElements: 9 })
  const { width, height } = ctx.canvas
  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * (width / 3)
    const y = Math.floor(i / 3) * (height / 3)
    ctx.fillStyle = squareColors[i]!
    ctx.fillRect(x, y, width / 3, height / 3)
  }
}

const drawRhombus = (ctx: CanvasRenderingContext2D) => {
  const [rhombusColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 2, distinct: true })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = rhombusColor

  const halfWidth = width / 2
  const halfHeight = height / 2
  const twoThirdsWidth = (2 / 3) * width / 2
  const twoThirdsHeight = (2 / 3) * height / 2

  ctx.beginPath()
  ctx.moveTo(halfWidth, halfHeight - twoThirdsHeight) // Top vertex
  ctx.lineTo(halfWidth + twoThirdsWidth, halfHeight) // Right vertex
  ctx.lineTo(halfWidth, halfHeight + twoThirdsHeight) // Bottom vertex
  ctx.lineTo(halfWidth - twoThirdsWidth, halfHeight) // Left vertex
  ctx.closePath()
  ctx.fill()
}

const drawConcentricCircles = (ctx: CanvasRenderingContext2D) => {
  const [circleColor, secondCircleColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 3 })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  const firstCircleRadius = width / 4
  const secondCircleRadius = width / 8
  ctx.fillStyle = circleColor
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, firstCircleRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = secondCircleColor
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, secondCircleRadius, 0, Math.PI * 2)
  ctx.fill()
}

const drawDiagonalStripe = (ctx: CanvasRenderingContext2D) => {
  rotateCanvasRandomly(ctx)
  const [stripeColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 2, distinct: true })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = stripeColor
  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width, 0)
  ctx.lineTo(width / 2, height)
  ctx.lineTo(0, height)
  ctx.closePath()

  ctx.fill()
}

const drawQuarterOfCircle = (ctx: CanvasRenderingContext2D) => {
  rotateCanvasRandomly(ctx)
  const [firstArcColor, secondArcColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 3 })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Draw the outermost quarter circle
  ctx.fillStyle = firstArcColor
  ctx.beginPath()
  ctx.arc(0, 0, width * 2 / 3, 0, Math.PI / 2)
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.fill()

  // Draw the innermost quarter circle
  ctx.fillStyle = secondArcColor
  ctx.beginPath()
  ctx.arc(0, 0, width / 3, 0, Math.PI / 2)
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.fill()
}

const drawLargeQuarterOfCircle = (ctx: CanvasRenderingContext2D) => {
  rotateCanvasRandomly(ctx)
  const [firstArcColor, secondArcColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 3 })
  const { width, height } = ctx.canvas

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Draw the outermost quarter circle
  ctx.fillStyle = firstArcColor
  ctx.beginPath()
  ctx.arc(0, 0, width, 0, Math.PI / 2)
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.fill()

  // Draw the innermost quarter circle
  ctx.fillStyle = secondArcColor
  ctx.beginPath()
  ctx.arc(0, 0, width * 2 / 3, 0, Math.PI / 2)
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.fill()
}

const drawFourOverlappingCircles = (ctx: CanvasRenderingContext2D) => {
  const [circleColor, altCircleColor, smallCircleColor, backgroundColor] = getRandomArrayElements(lighterColors, { numberOfElements: 4 })
  const { width, height } = ctx.canvas

  const radius = width / 6
  const smallRadius = radius / 3
  const gap = 0
  const startX = width / 2 - radius
  const startY = height / 2 - radius

  // Set background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Positions for the four circles
  const positions = [
    { x: startX, y: startY },
    { x: startX + 2 * radius + gap, y: startY },
    { x: startX, y: startY + 2 * radius + gap },
    { x: startX + 2 * radius + gap, y: startY + 2 * radius + gap },
  ]

  // Draw large circles
  positions.forEach((pos, index) => {
    ctx.fillStyle = index === 0 || index === (positions.length - 1) ? circleColor : altCircleColor
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    ctx.fill()
  })

  // Draw small white circles in the center
  ctx.fillStyle = smallCircleColor
  for (const pos of positions) {
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, smallRadius, 0, Math.PI * 2)
    ctx.fill()
  }
}

type DrawPatternFunction = (ctx: CanvasRenderingContext2D) => void
export const drawPatternFunctions: DrawPatternFunction[] = [
  drawSplitSquare,
  drawNineCircles,
  drawNineSquares,
  drawRhombus,
  drawConcentricCircles,
  drawDiagonalStripe,
  drawConcentricCircles,
  drawQuarterOfCircle,
  drawLargeQuarterOfCircle,
  drawFourOverlappingCircles,
]
