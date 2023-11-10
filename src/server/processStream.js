import {textToSpeech} from "./openai"
import {checkText, getTextForToolsMessage} from "./text"
import {mergeWith} from "ramda"

/**
 * Factory function that returns a function to process a stream of text parts and push audio parts to the output.
 *
 * @returns {Function} Function that takes a text part, a push function, and an end flag, and pushes audio parts to the output.
 */
const maybePushAudioFactory = () => {
  let text = ""
  let promises = []

  return async (part, push, end) => {
    text += part
    const [forAudio, remaining] = end ? [text, ""] : checkText(text)
    text = remaining
    if (forAudio) {
      // need to keep a track of promises to prevent the stream from being closed
      // before all the audio has been generated and pushed
      promises.push(
        textToSpeech(forAudio).then((audio) =>
          push({type: "audio/mpeg", value: audio})
        )
      )
    }
    if (end) {
      await Promise.all(promises)
      push({})
    }
  }
}

const maybePushToolsFactory = (maybePushAudio, push) => {
  let tools = []
  return (toolDelta) => {
    if (!toolDelta) {
      // finished receiving tool deltas
      push({type: "application/json", value: tools})
      maybePushAudio(getTextForToolsMessage(tools), push)
      return
    }
    toolDelta.forEach((tool) => {
      if (!tools[tool.index]) {
        tools[tool.index] = tool
      } else {
        tools[tool.index].function = mergeWith(
          (a, b) => a + b,
          tools[tool.index].function,
          tool.function
        )
      }
    })
  }
}

export const processStream = async ({stream, push}) => {
  const maybePushAudio = maybePushAudioFactory()
  const maybePushTools = maybePushToolsFactory(maybePushAudio, push)

  try {
    for await (const part of stream) {
      const partText = part.choices[0]?.delta?.content || ""
      if (!partText && part.choices[0]?.delta?.tool_calls) {
        maybePushTools(part.choices[0]?.delta?.tool_calls)
      } else if (part.choices[0]?.finish_reason === "tool_calls") {
        maybePushTools()
      } else {
        push({type: "text/plain", value: partText})
        // todo: check if we can get rid of this await
        await maybePushAudio(partText, push)
      }
    }
  } finally {
    await maybePushAudio("", push, true)
  }
}
