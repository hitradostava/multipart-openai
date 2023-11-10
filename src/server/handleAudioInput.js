import {speechToText} from "./openai"

export const handleAudioInput = async ({file, messages, push}) => {
  if (file) {
    const text = await speechToText(file)
    const userMessage = {role: "user", content: text}
    messages.push(userMessage)
    push({type: "text/plain; role=user", value: userMessage.content})
  }
  return messages
}
