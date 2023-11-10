/**
 * Pipes a readable stream to an already initialized writer from a writable stream.
 *
 * @param {ReadableStream} readable - The readable stream to pipe from.
 * @param {function} writer - The initialized writer from a writable stream to pipe to.
 * @returns {Promise<void>} A promise that resolves when the stream is fully piped.
 */
export async function pipeStream(readable, writer) {
  const reader = readable.getReader()
  let done, value

  do {
    ;({done, value} = await reader.read())
    if (value) {
      await writer.write(value)
    }
  } while (!done)

  reader.releaseLock()
  // Resolve when the stream is fully piped
  return
}
