// Helper function to find the index of a Uint8Array in another Uint8Array
export function indexOfUint8Array(buffer, searchElement) {
  // Loop through the buffer to find the searchElement
  for (let i = 0; i <= buffer.length - searchElement.length; i++) {
    let foundMatch = true
    // Check if all elements in searchElement match the corresponding elements in buffer
    for (let j = 0; j < searchElement.length; j++) {
      if (buffer[i + j] !== searchElement[j]) {
        foundMatch = false
        break
      }
    }
    if (foundMatch) {
      return i
    }
  }
  return -1 // Return -1 if no match is found
}

// Helper function to concatenate two Uint8Arrays
export function concatUint8Arrays(buffer1, buffer2) {
  // Create a new Uint8Array with a size that is the sum of the two arrays
  const concatenatedBuffer = new Uint8Array(buffer1.length + buffer2.length)
  // Set the first part of the new array to be buffer1
  concatenatedBuffer.set(buffer1)
  // Set the second part of the new array to be buffer2, starting at the end of buffer1
  concatenatedBuffer.set(buffer2, buffer1.length)
  return concatenatedBuffer
}
