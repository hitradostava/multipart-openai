import {useCallback, useEffect, useRef, useState} from "react"
import sendFactory from "./sendFactory"
import {dissoc} from "ramda"

const useChatStream = ({enqueueAudio, url, handleFunction}) => {
  const [messages, setMessages] = useState([])
  const streamStops = useRef([])
  const addMessage = useCallback(
    (newMessage) => {
      setMessages((msgs) => {
        if (Array.isArray(newMessage)) {
          return [...msgs, ...newMessage]
        }
        if (
          newMessage.role === "assistant" &&
          msgs[msgs.length - 1]?.role === "assistant"
        ) {
          const lastMessage = msgs[msgs.length - 1]
          const updated = {...lastMessage}
          updated.content += newMessage.content
          return [...msgs.slice(0, msgs.length - 1), updated]
        }
        return [...msgs, newMessage]
      })
    },
    [setMessages]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const send = useCallback(
    sendFactory({addMessage, enqueueAudio, handleFunction, streamStops, url}),
    [addMessage, enqueueAudio, handleFunction, streamStops, url]
  )

  useEffect(() => {
    console.log(messages)
    if (messages.find((m) => m.send)) {
      const formData = new FormData()
      const updated = messages.map(dissoc("send"))
      formData.append("messages", JSON.stringify(updated))
      send({body: formData})
      setMessages(updated)
    }
  }, [messages, send])

  const handleNewText = useCallback((content) => {
    const message = {role: "user", content, send: true}
    setMessages((msgs) => [...msgs, message])
  }, [])

  const handleNewAudio = useCallback(
    (audioBlob) => {
      const formData = new FormData()
      formData.append("messages", JSON.stringify(messages))
      formData.append("file", audioBlob, "audio.webm")
      send({body: formData})
    },
    [send, messages]
  )

  // clean up function to cancel any streams on dismount
  // many of these functions will be noops
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      streamStops.current.forEach((fn) => fn())
    }
  }, [])

  return {handleNewText, handleNewAudio, messages}
}

export default useChatStream
