import {pipeStream} from "./pipeStream"
import {BOUNDARY, WORDS_PER_CHUNK} from "@/constants"

const encoder = new TextEncoder()

export function createStream() {
  const {readable, writable} = new TransformStream()
  const writer = writable.getWriter()
  let lastType = null
  let writePromise = Promise.resolve() // Start with a resolved promise
  let wordsWritten = 0

  const push = ({type, value}) => {
    // Queue the write operation
    writePromise = writePromise
      .then(async () => {
        const isText = type && type.includes("text/plain")
        const isStart = !lastType
        const isEnd = !type && !value
        const isNewType = lastType && lastType !== type
        const enoughWords = wordsWritten > WORDS_PER_CHUNK

        // Write a new boundary under the following conditions:
        // - this is the first write
        // - the type has changed
        // - the type is text and we've written enough words
        // - the type is not text (i.e each audio file or json object gets its own boundary)
        if (isStart || isNewType || !isText || enoughWords) {
          wordsWritten = 0
          await writer.write(encoder.encode(`\r\n${BOUNDARY}\r\n`))
          if (type) {
            await writer.write(encoder.encode(`Content-Type: ${type}\r\n\r\n`))
          }
        }
        lastType = type

        if (value) {
          if (isText) {
            wordsWritten += value.split(" ").length
          }

          if (type === "audio/mpeg") {
            // for audio files, we use a custom pipe function that doesn't close the writer
            // once the audio is written
            await pipeStream(value, writer)
          } else if (type === "application/json") {
            await writer.write(encoder.encode(JSON.stringify(value)))
          } else {
            console.log(value)
            await writer.write(encoder.encode(value))
          }
        }

        if (isEnd) {
          // end
          writer.close()
        }
      })
      .catch((err) => {
        console.error("Error in writePromise chain", err)
      })

    // Return the current write promise so that callers can await if they choose
    return writePromise
  }

  return {readable, push}
}
