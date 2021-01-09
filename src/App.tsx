// import * as bodyPix from '@tensorflow-models/body-pix'
// import * as tf from '@tensorflow/tfjs'
// import React, { useEffect, useState } from 'react'
import VideoPlayer from './components/VideoPlayer'
import useBodyPix from './hooks/useBodyPix'

function App() {
  // Load BodyPix only once outside of VideoPlayer component to prevent
  // GPU memory issues with Create React App HMR
  const bodyPixNeuralNetwork = useBodyPix()

  // const canvasRef = useRef<HTMLCanvasElement>(null)

  // useEffect(() => {
  //   const canvas = canvasRef.current!
  //   const ctx = canvas.getContext('2d')!

  //   const stats = new Stats()
  //   stats.showPanel(0)
  //   document.body.appendChild(stats.dom)

  //   const video = document.createElement('video')
  //   video.autoplay = true
  //   video.playsInline = true
  //   video.controls = false
  //   video.onloadeddata = drawBackground

  //   const backgroundImage = new Image()
  //   backgroundImage.src = controlRoomImage

  //   let mask: ImageData

  //   let videoWidth: number
  //   let videoHeight: number
  //   let videoPixelCount: number

  //   let bodyPixNet: bodyPix.BodyPix
  //   let drawBackgroundHandle: number

  //   async function loadBodyPix() {
  //     await tf.ready()
  //     bodyPixNet = await bodyPix.load()
  //   }

  //   async function setupCamera() {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       })
  //       const [videoTrack] = stream.getVideoTracks()
  //       const videoSettings = videoTrack.getSettings()
  //       videoWidth = videoSettings.width!
  //       videoHeight = videoSettings.height!
  //       videoPixelCount = videoWidth * videoHeight

  //       video.srcObject = stream
  //       video.width = videoWidth
  //       video.height = videoHeight

  //       backgroundImage.width = videoWidth
  //       backgroundImage.height = videoHeight

  //       canvas.width = videoWidth
  //       canvas.height = videoHeight

  //       mask = new ImageData(videoWidth, videoHeight)
  //     } catch (error) {
  //       console.error('Error opening video camera.', error)
  //     }
  //   }

  //   async function drawBackground() {
  //     // Wait for BodyPix model to be loaded
  //     if (bodyPixNet) {
  //       stats.begin()

  //       const segmentation = await bodyPixNet.segmentPerson(video)
  //       for (let i = 0; i < videoPixelCount; i++) {
  //         // Set only the alpha component of each pixel
  //         mask.data[i * 4 + 3] = segmentation.data[i] ? 255 : 0
  //       }
  //       ctx.putImageData(mask, 0, 0)
  //       ctx.globalCompositeOperation = 'source-in'
  //       ctx.drawImage(video, 0, 0)
  //       ctx.globalCompositeOperation = 'destination-over'
  //       ctx.drawImage(backgroundImage, 0, 0)

  //       stats.end()
  //     }

  //     drawBackgroundHandle = requestAnimationFrame(drawBackground)
  //   }

  //   loadBodyPix()
  //   setupCamera()

  //   return () => {
  //     cancelAnimationFrame(drawBackgroundHandle)
  //     stats.dom.remove()
  //   }
  // }, [])

  // return <canvas className="App-canvas" ref={canvasRef}></canvas>
  return <VideoPlayer bodyPixNeuralNetwork={bodyPixNeuralNetwork}></VideoPlayer>
}

export default App
