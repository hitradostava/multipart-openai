import {CHAT_MODEL, STT_MODEL, TTS_MODEL, VOICE, TOOLS} from "@/constants"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Converts text to speech using OpenAI's TTS model.
 * @param {string} text - The text to convert to speech.
 * @returns {Promise<ReadableStream>} - A Promise that resolves with a ReadableStream containing the audio data.
 */
export const textToSpeech = async (text) => {
  const voice = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: VOICE,
    input: text,
  })

  return voice.body
}

/**
 * Transcribes speech from an audio file using OpenAI's Speech-to-Text API.
 * @param {File} file - The audio file to transcribe.
 * @returns {Promise<string>} A Promise that resolves with the transcribed text.
 */
export const speechToText = async (file) => {
  const {text} = await openai.audio.transcriptions.create({
    file,
    model: STT_MODEL,
  })

  return text
}

/**
 * Returns a chat stream from OpenAI's API based on the provided messages.
 * @param {Array} messages - An array of messages to send to the chat API.
 * @returns {Promise} - A promise that resolves to the chat stream.
 */
export const getChatStream = async (messages) => {
  const stream = await openai.chat.completions.create({
    model: CHAT_MODEL,
    stream: true,
    tools: TOOLS,
    messages: messages.map((msg) => {
      // strip out any additional keys and ensure that function results are stringified
      if (msg.role === "tool") {
        return {
          role: msg.role,
          content: JSON.stringify(msg.content),
          tool_call_id: msg.tool_call_id,
        }
      }
      return {
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
      }
    }),
  })
  return stream
}
