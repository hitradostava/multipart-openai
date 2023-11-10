"use client"
import {useState} from "react"
import useAudioQueue from "@/hooks/useAudioQueue"
import useAudioRecorder from "@/hooks/useAudioRecorder"
import useChatStream from "@/hooks/useChatStream"
import {mergeLeft} from "ramda"
import ReactMarkdown from "react-markdown"
import {UserIcon} from "@heroicons/react/24/outline"
import Waveform from "./waveform"

const RoleAvatar = ({role}) => {
  if (role === "user") {
    return (
      <div className="rounded-full p-1 border bg-green-700 text-white text-xs w-6 h-6">
        <UserIcon className="w-full h-full" />
      </div>
    )
  }
  if (role === "assistant") {
    return (
      <div className="rounded-full p-1 border border-white bg-teal-700 text-white text-xs w-6 h-6 flex items-center justify-center">
        AI
      </div>
    )
  }
}

const Triangle = ({style}) => {
  return (
    <svg style={style} viewBox="0 0 100 100">
      <polygon points="50,15 100,100 0,100" />
    </svg>
  )
}

const Circle = ({style}) => {
  return (
    <svg style={style} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" />
    </svg>
  )
}

const Square = ({style}) => {
  return (
    <svg style={style} viewBox="0 0 100 100">
      <rect x="10" y="10" width="80" height="80" />
    </svg>
  )
}

export default function AudioChat() {
  const url = "/api"

  const [square, setSquare] = useState({
    width: "64px",
    height: "64px",
    fill: "#ef4444",
  })
  const [circle, setCircle] = useState({
    width: "64px",
    height: "64px",
    fill: "#10b981",
  })
  const [triangle, setTriangle] = useState({
    width: "64px",
    height: "64px",
    fill: "#3b82f6",
  })

  const handleFunction = async (item) => {
    const name = item.function.name
    const style = JSON.parse(item.function.arguments)
    if (name === "set_circle_style") {
      setCircle(mergeLeft(style))
      return "ok"
    } else if (name === "set_square_style") {
      setSquare(mergeLeft(style))
      return "ok"
    } else if (name === "set_triangle_style") {
      setTriangle(mergeLeft(style))
      return "ok"
    }
  }

  const {enqueueAudio, stop, playing} = useAudioQueue()
  const {handleNewText, handleNewAudio, messages} = useChatStream({
    enqueueAudio,
    url,
    handleFunction,
  })

  const {recordingState, startRecording, stopRecording, audioData} =
    useAudioRecorder({handleNewAudio})

  const [text, setText] = useState("")

  const startRecordingAudio = () => {
    if (playing) {
      stop()
    }
    startRecording()
  }

  return (
    <div className="bg-gray-800 shadow-xl p-4 min-h-screen flex">
      <div className="max-w-lg">
        <h3 className="text-xl ml-10">
          Multipart Stream Demo - Voice, Text & Tools
        </h3>
        <ul className="mt-8 w-full space-y-2">
          {messages.map((msg, idx) =>
            msg.content && msg.content.trim() && msg.role !== "tool" ? (
              <li key={idx} className="flex space-x-4">
                <RoleAvatar role={msg.role} />
                <section className="max-w-sm prose prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>{" "}
                </section>
              </li>
            ) : null
          )}
        </ul>
        <div className="my-4 relative pl-10 w-[32rem]">
          <textarea
            className="border border-gray-200 bg-gray-800 text-white w-full pr-20 rounded p-2 "
            value={text}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                handleNewText(text)
                setText("")
              }
            }}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="border border-white rounded p-2 absolute top-1/2 -mt-6 right-2 hover:bg-gray-900"
            onClick={() => {
              handleNewText(text)
              setText("")
            }}
          >
            Send
          </button>
        </div>

        <div className="pl-10 space-x-2">
          {recordingState ? (
            <>
              <button
                className="border border-white rounded p-2 hover:bg-gray-900"
                onClick={stopRecording}
              >
                Stop Recording
              </button>
              <Waveform audioData={audioData} />
            </>
          ) : (
            <button
              className="border border-white rounded p-2 hover:bg-gray-900"
              onClick={startRecordingAudio}
            >
              Start Recording
            </button>
          )}
          {playing ? (
            <>
              <button
                className="border border-white rounded p-2 hover:bg-gray-900"
                onClick={stop}
              >
                Stop Audio Playing
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col p-8 space-y-4 items-center justify-end flex-1">
        <Triangle style={triangle} />
        <Circle style={circle} />
        <Square style={square} />
      </div>
    </div>
  )
}
