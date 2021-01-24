import * as tfBodyPix from '@tensorflow-models/body-pix'
import * as tf from '@tensorflow/tfjs'
import { useEffect, useState } from 'react'

function useBodyPix() {
  const [bodyPix, setBodyPix] = useState<tfBodyPix.BodyPix>()

  useEffect(() => {
    async function loadBodyPix() {
      console.log('Loading TensorFlow.js and BodyPix segmentation model')
      await tf.ready()
      setBodyPix(await tfBodyPix.load())
      console.log('TensorFlow.js and BodyPix loaded')
    }

    loadBodyPix()
  }, [])

  return bodyPix
}

export default useBodyPix
