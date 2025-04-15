<template>
  <canvas
    ref="canvas"
    class="object-cover w-full"
    width="500"
    height="500"
  />
</template>

<script setup lang='ts'>
import { drawPatternFunctions } from './drawPatternFunctions'

defineComponent({ name: 'LoginCardCanvasPattern' })

const canvas = ref<HTMLCanvasElement>()
onMounted(() => {
  const canvasContext = canvas.value?.getContext('2d')
  if (!canvasContext) {
    console.warn('No canvas context found')
    return
  }
  const [drawFunction] = getRandomArrayElements(drawPatternFunctions, { numberOfElements: 1 })

  drawFunction(canvasContext)
})
</script>
