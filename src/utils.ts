import type { Tuple } from './helpers'

/**
 * Randomly gets a number of elements from an array.
 * You can specify whether they should be distinct.
 * If the number of requested elements is higher than the number of elements in the array,
 * then elements won't be guaranteed to be distinct.
 */
export const getRandomArrayElements = <T, const N extends number>(myArray: T[], config: { numberOfElements: N, distinct?: boolean }) => {
  const { numberOfElements, distinct } = config
  const randomElements: T[] = []
  const tempArray = [...myArray]
  for (let i = 0; i < numberOfElements; i++) {
    const index = Math.floor(Math.random() * tempArray.length)
    const randomElement = myArray[index]!
    randomElements.push(randomElement)
    if (distinct && numberOfElements < myArray.length) {
      tempArray.splice(index, 1)
    }
  }
  return randomElements as Tuple<T, N>
}
