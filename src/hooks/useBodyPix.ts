import * as bodyPix from '@tensorflow-models/body-pix'
import * as tf from '@tensorflow/tfjs'
import { useEffect, useState } from 'react'

function useBodyPix() {
  const [
    bodyPixNeuralNetwork,
    setBodyPixNeuralNetwork,
  ] = useState<bodyPix.BodyPix>()

  useEffect(() => {
    async function loadBodyPix() {
      console.log('Loading TensorFlow.js and BodyPix segmentation model')
      await tf.ready()
      setBodyPixNeuralNetwork(await bodyPix.load())
      console.log('TensorFlow.js and BodyPix loaded')
    }

    loadBodyPix()
  }, [])

  return bodyPixNeuralNetwork
}

export default useBodyPix
