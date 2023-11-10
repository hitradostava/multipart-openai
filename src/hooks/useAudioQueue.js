import {useState, useEffect, useCallback} from "react"

const useAudioQueue = () => {
  const [audioQueue, setAudioQueue] = useState([])
  const [currentAudio, setCurrentAudio] = useState(null)

  const stop = () => {
    if (currentAudio) {
      currentAudio.pause()
      URL.revokeObjectURL(currentAudio.src) // Clean up the object URL
      setCurrentAudio(null)
      setAudioQueue([])
    }
  }

  // Function to add a new audio URL to the queue
  const enqueueAudio = useCallback((audioBlob) => {
    const audioUrl = URL.createObjectURL(audioBlob)
    setAudioQueue((prevQueue) => [...prevQueue, audioUrl])
  }, [])

  // Effect to start playing when currentAudio is set
  useEffect(() => {
    if (currentAudio) {
      currentAudio.play()
      currentAudio.addEventListener("ended", () => {
        URL.revokeObjectURL(currentAudio.src) // Clean up the object URL
        setCurrentAudio(null) // Allow the next audio to be set
      })
    }
  }, [currentAudio])

  // Effect to play the next audio when the queue updates and there's no currently playing audio
  useEffect(() => {
    if (audioQueue.length > 0 && !currentAudio) {
      const nextAudioUrl = audioQueue[0]
      setCurrentAudio(new Audio(nextAudioUrl))
      setAudioQueue((prevQueue) => prevQueue.slice(1))
    }
  }, [audioQueue, currentAudio])

  return {enqueueAudio, stop, playing: !!currentAudio, finished: audioQueue.length === 0}
}

export default useAudioQueue
