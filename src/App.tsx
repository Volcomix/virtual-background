import * as bodyPix from '@tensorflow-models/body-pix'
import React, { useEffect, useRef } from 'react'
import Stats from 'stats.js'
import './App.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)

    const video = document.createElement('video')
    video.autoplay = true
    video.playsInline = true
    video.controls = false
    video.onloadeddata = drawBackground

    let bodyPixNet: bodyPix.BodyPix
    let drawBackgroundHandle: number

    async function loadBodyPix() {
      bodyPixNet = await bodyPix.load()
    }

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        const [videoTrack] = stream.getVideoTracks()
        const { width, height } = videoTrack.getSettings()
        video.srcObject = stream
        video.width = width!
        video.height = height!
      } catch (error) {
        console.error('Error opening video camera.', error)
      }
    }

    async function drawBackground() {
      // Wait for BodyPix model to be loaded
      if (bodyPixNet) {
        stats.begin()

        const segmentation = await bodyPixNet.segmentPerson(video)
        bodyPix.drawBokehEffect(canvasRef.current!, video, segmentation)

        stats.end()
      }

      drawBackgroundHandle = requestAnimationFrame(drawBackground)
    }

    loadBodyPix()
    setupCamera()

    return () => {
      cancelAnimationFrame(drawBackgroundHandle)
      stats.dom.remove()
    }
  }, [])

  return <canvas className="App-canvas" ref={canvasRef}></canvas>
}

export default App
