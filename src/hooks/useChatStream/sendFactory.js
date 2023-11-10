import {concatUint8Arrays, indexOfUint8Array} from "./array"
import {handlePartFactory} from "./handlePartFactory"
import {BOUNDARY} from "@/constants"

const encoder = new TextEncoder()
const boundary = encoder.encode(BOUNDARY)

const sendFactory = ({
  addMessage,
  enqueueAudio,
  handleFunction,
  streamStops,
  url,
}) => {
  const send = async ({body, headers}) => {
    const handlePart = handlePartFactory({
      addMessage,
      enqueueAudio,
      handleFunction,
    })
    const response = await fetch(url, {body, headers, method: "POST"})
    const reader = response.body.getReader()
    let {value, done} = await reader.read()
    let buffer = value
    if (done) {
      handlePart()
    }

    while (!done) {
      // Search for the boundary in the buffer
      let boundaryIndex = indexOfUint8Array(buffer, boundary)

      while (boundaryIndex === -1 && !done) {
        // We haven't found the boundary, read more data
        ;({value, done} = await reader.read())
        if (value) {
          buffer = concatUint8Arrays(buffer, value)
          boundaryIndex = indexOfUint8Array(buffer, boundary)
        }
      }

      if (boundaryIndex >= 0) {
        // Process the part we have found
        const part = buffer.slice(0, boundaryIndex)
        handlePart(part)
        // Remove the processed part from the buffer
        buffer = buffer.slice(boundaryIndex + boundary.length + 2) // +2 for the \r\n
      }
    }

    streamStops.current.push(() => {
      if (!done) {
        reader.cancel()
      }
    })
  }
  return send
}

export default sendFactory
