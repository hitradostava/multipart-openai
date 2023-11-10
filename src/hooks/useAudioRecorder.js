import {useState, useEffect, useCallback} from "react"

const useAudioRecorder = ({
  handleNewAudio,
  silenceThreshold = 0.02,
  silenceTime = 2000,
}) => {
  const [recording, setRecording] = useState(false)
  const [audioData, setAudioData] = useState(new Uint8Array(0))

  useEffect(() => {
    let recorder, analyser, microphone, processor
    const create = async () => {
      let lastTime = Date.now()
      const stream = await navigator.mediaDevices.getUserMedia({audio: true})
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      microphone = audioContext.createMediaStreamSource(stream)
      processor = audioContext.createScriptProcessor(4096, 1, 1)
      microphone.connect(analyser)
      analyser.connect(processor)
      processor.connect(audioContext.destination)
      const options = {mimeType: "audio/webm"}
      recorder = new MediaRecorder(stream, options)
      recorder.ondataavailable = async (event) => {
        const blob = event.data
        handleNewAudio(blob)
      }
      recorder.start()
      processor.onaudioprocess = function (event) {
        const array = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(array)
        const average = array.reduce((a, b) => a + b) / array.length
        const normalized = average / 128 // Normalize to range of 0 to 1

        if (normalized < silenceThreshold) {
          if (Date.now() - lastTime > silenceTime) {
            console.log("silence...")
            recorder.stop()
            setRecording(false)
            lastTime = Date.now()
          }
        } else {
          lastTime = Date.now()
          const array = new Uint8Array(analyser.fftSize)
          analyser.getByteTimeDomainData(array)
          setAudioData(array)
        }
      }
    }
    if (recording) {
      create()
    }

    return () => {
      // this should run on dismount, but also each time recording changes, but prior to the effect
      if (recorder?.state === "recording") {
        recorder?.stop()
      }
      recorder?.stream.getTracks().forEach((track) => track.stop())
      microphone?.disconnect()
      processor?.disconnect()
      analyser?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording])

  const start = useCallback(() => {
    setRecording(true)
  }, [])

  const stop = useCallback(() => {
    setRecording(false)
  }, [])

  return {
    recordingState: recording,
    startRecording: start,
    stopRecording: stop,
    audioData,
  }
}

export default useAudioRecorder
