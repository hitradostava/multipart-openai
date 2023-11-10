import {nanoid} from "nanoid"
import {getContent} from "./getContent"

export const handlePartFactory = ({
  addMessage,
  enqueueAudio,
  handleFunction,
}) => {
  const id = nanoid()
  return async (part) => {
    const {contentType, content} = getContent(part)
    if (contentType === "text/plain+user") {
      // if an audio recording was sent, then add to the messages array as a user role
      addMessage({role: "user", content, id})
    } else if (contentType === "text/plain") {
      addMessage({role: "assistant", content, id})
    } else if (contentType === "audio/mpeg") {
      const audioBlob = new Blob([content], {type: "audio/mpeg"})
      // play the audio
      enqueueAudio(audioBlob)
    } else if (contentType === "application/json") {
      const results = await Promise.all(content.map(handleFunction))

      addMessage([
        {role: "assistant", id, content: null, tool_calls: content},
        ...results.map((result, idx) => ({
          role: "tool",
          content: result,
          send: true,
          tool_call_id: content[idx].id,
        })),
      ])
    }
  }
}
