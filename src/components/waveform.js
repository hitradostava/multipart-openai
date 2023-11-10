import { useEffect, useRef } from "react"

const drawWaveform = (canvas, audioData) => {
  const canvasCtx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height
  canvasCtx.clearRect(0, 0, width, height)

  canvasCtx.lineWidth = 2
  canvasCtx.strokeStyle = "rgb(255, 255, 255)"
  canvasCtx.beginPath()

  const sliceWidth = (width * 1.0) / audioData.length
  let x = 0

  for (let i = 0; i < audioData.length; i++) {
    const v = audioData[i] / 128.0
    const y = (v * height) / 2

    if (i === 0) {
      canvasCtx.moveTo(x, y)
    } else {
      canvasCtx.lineTo(x, y)
    }

    x += sliceWidth
  }
  canvasCtx.lineTo(canvas.width, canvas.height / 2)
  canvasCtx.stroke()
}

export default function Waveform({audioData}) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      drawWaveform(canvas, audioData)
    }
  }, [audioData])

  return <canvas ref={canvasRef} width="300" height="100" />
}


