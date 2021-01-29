import { useEffect, useState } from 'react'
import { SegmentationConfig } from '../helpers/segmentationHelper'
import { TFLite } from './useTFLite'

function useMeetModel(
  tflite: TFLite | undefined,
  segmentationConfig: SegmentationConfig
) {
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadMeetModel() {
      if (!tflite || segmentationConfig.model !== 'meet') {
        return
      }

      setLoaded(false)

      const modelFileName =
        segmentationConfig.inputResolution === '144p'
          ? 'segm_full_v679'
          : 'segm_lite_v681'
      console.log('Loading meet model:', modelFileName)

      const modelResponse = await fetch(
        `${process.env.PUBLIC_URL}/models/${modelFileName}.tflite`
      )
      const model = await modelResponse.arrayBuffer()
      console.log('Model buffer size:', model.byteLength)

      const modelBufferOffset = tflite._getModelBufferMemoryOffset()
      console.log('Model buffer memory offset:', modelBufferOffset)
      console.log('Loading model buffer...')
      tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset)
      console.log('_loadModel result:', tflite._loadModel(model.byteLength))

      console.log('Input memory offset:', tflite._getInputMemoryOffset())
      console.log('Input height:', tflite._getInputHeight())
      console.log('Input width:', tflite._getInputWidth())
      console.log('Input channels:', tflite._getInputChannelCount())

      console.log('Output memory offset:', tflite._getOutputMemoryOffset())
      console.log('Output height:', tflite._getOutputHeight())
      console.log('Output width:', tflite._getOutputWidth())
      console.log('Output channels:', tflite._getOutputChannelCount())

      setLoaded(true)
    }

    loadMeetModel()
  }, [tflite, segmentationConfig])

  return isLoaded
}

export default useMeetModel
