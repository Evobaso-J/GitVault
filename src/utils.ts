import type { Tuple } from './helpers'

/**
 * Randomly gets a number of elements from an array.
 * You can specify whether they should be distinct.
 * If the number of requested elements is higher than the number of elements in the array,
 * then elements won't be guaranteed to be distinct.
 */
export const getRandomArrayElements = <T, const N extends number>(arr: T[], config: { numberOfElements: N, distinct?: boolean }) => {
  const { numberOfElements, distinct } = config
  const randomElements: T[] = []
  const tempArray = [...arr]
  for (let i = 0; i < numberOfElements; i++) {
    const index = Math.floor(Math.random() * tempArray.length)
    const randomElement = tempArray[index]!
    randomElements.push(randomElement)
    if (distinct && numberOfElements < arr.length) {
      tempArray.splice(index, 1)
    }
  }
  return randomElements as Tuple<T, N>
}

/**
 * Stops the execution of the program for a specified amount of time.
 * Useful for transitions and animations.
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
