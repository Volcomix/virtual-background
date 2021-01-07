import * as bodyPix from '@tensorflow-models/body-pix'
import React, { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>()
  const netRef = useRef<bodyPix.BodyPix>()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        const [videoTrack] = stream.getVideoTracks()
        const { width, height } = videoTrack.getSettings()

        const video = document.createElement('video')
        video.autoplay = true
        video.playsInline = true
        video.controls = false
        video.width = width!
        video.height = height!
        video.srcObject = stream
        video.onloadeddata = drawBackground

        videoRef.current = video
      } catch (error) {
        console.error('Error opening video camera.', error)
      }
    }

    async function drawBackground() {
      const segmentation = await netRef.current!.segmentPerson(
        videoRef.current!,
      )
      bodyPix.drawBokehEffect(
        canvasRef.current!,
        videoRef.current!,
        segmentation,
      )

      requestAnimationFrame(drawBackground)
    }

    setupCamera()
  }, [])

  useEffect(() => {
    async function loadBodyPixModel() {
      netRef.current = await bodyPix.load()
    }

    loadBodyPixModel()
  }, [])

  return <canvas ref={canvasRef}></canvas>
}

export default App
