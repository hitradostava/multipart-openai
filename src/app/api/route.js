import {getChatStream} from "@/server/openai"
import {handleAudioInput} from "@/server/handleAudioInput"
import {BOUNDARY} from "@/constants"
import {createStream} from "@/server/createStream"
import {processStream} from "@/server/processStream"

export const runtime = "edge"

export const POST = async (req) => {
  const {readable, push} = createStream()
  const form = await req.formData()
  const file = form.get("file")

  // the browser may send an audio file with the users input
  // in this case, we want to
  // 1. transcribe the audio
  // 2. add the text to the messages array
  // 3. push the text to the stream so it can be displayed in the browser
  const messages = await handleAudioInput({
    file,
    messages: JSON.parse(form.get("messages")),
    push,
  })

  // Get a chat stream that may contain text and tool responses
  const stream = await getChatStream(messages)
  // Process the chat stream:
  // 1. Push text to the stream
  // 2. Create audio from full sentences and push to the stream
  // 3. Collect and parse JSON tool responses and push to the stream
  processStream({stream, push})

  return new Response(readable, {
    headers: {
      "Content-Type": `multipart/x-mixed-replace; boundary=${BOUNDARY}`,
    },
  })
}
