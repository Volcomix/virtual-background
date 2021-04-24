import { useEffect, useState } from 'react'
import {
  getTFLiteModelFileName,
  SegmentationConfig,
} from '../helpers/segmentationHelper'

declare function createTFLiteModule(): Promise<TFLite>
declare function createTFLiteSIMDModule(): Promise<TFLite>

export interface TFLite extends EmscriptenModule {
  _getModelBufferMemoryOffset(): number
  _getInputMemoryOffset(): number
  _getInputHeight(): number
  _getInputWidth(): number
  _getInputChannelCount(): number
  _getOutputMemoryOffset(): number
  _getOutputHeight(): number
  _getOutputWidth(): number
  _getOutputChannelCount(): number
  _loadModel(bufferSize: number): number
  _runInference(): number
}

function useTFLite(segmentationConfig: SegmentationConfig) {
  const [tflite, setTFLite] = useState<TFLite>()
  const [tfliteSIMD, setTFLiteSIMD] = useState<TFLite>()
  const [selectedTFLite, setSelectedTFLite] = useState<TFLite>()
  const [isSIMDSupported, setSIMDSupported] = useState(false)

  useEffect(() => {
    async function loadTFLite() {
      createTFLiteModule().then(setTFLite)
      try {
        const createdTFLiteSIMD = await createTFLiteSIMDModule()
        setTFLiteSIMD(createdTFLiteSIMD)
        setSIMDSupported(true)
      } catch (error) {
        console.warn('Failed to create TFLite SIMD WebAssembly module.', error)
      }
    }

    loadTFLite()
  }, [])

  useEffect(() => {
    async function loadTFLiteModel() {
      if (
        !tflite ||
        (isSIMDSupported && !tfliteSIMD) ||
        (!isSIMDSupported && segmentationConfig.backend === 'wasmSimd') ||
        (segmentationConfig.model !== 'meet' &&
          segmentationConfig.model !== 'mlkit')
      ) {
        return
      }

      setSelectedTFLite(undefined)

      const newSelectedTFLite =
        segmentationConfig.backend === 'wasmSimd' ? tfliteSIMD : tflite

      if (!newSelectedTFLite) {
        throw new Error(
          `TFLite backend unavailable: ${segmentationConfig.backend}`
        )
      }

      const modelFileName = getTFLiteModelFileName(
        segmentationConfig.model,
        segmentationConfig.inputResolution
      )
      console.log('Loading tflite model:', modelFileName)

      const modelResponse = await fetch(
        `${process.env.PUBLIC_URL}/models/${modelFileName}.tflite`
      )
      const model = await modelResponse.arrayBuffer()
      console.log('Model buffer size:', model.byteLength)

      const modelBufferOffset = newSelectedTFLite._getModelBufferMemoryOffset()
      console.log('Model buffer memory offset:', modelBufferOffset)
      console.log('Loading model buffer...')
      newSelectedTFLite.HEAPU8.set(new Uint8Array(model), modelBufferOffset)
      console.log(
        '_loadModel result:',
        newSelectedTFLite._loadModel(model.byteLength)
      )

      console.log(
        'Input memory offset:',
        newSelectedTFLite._getInputMemoryOffset()
      )
      console.log('Input height:', newSelectedTFLite._getInputHeight())
      console.log('Input width:', newSelectedTFLite._getInputWidth())
      console.log('Input channels:', newSelectedTFLite._getInputChannelCount())

      console.log(
        'Output memory offset:',
        newSelectedTFLite._getOutputMemoryOffset()
      )
      console.log('Output height:', newSelectedTFLite._getOutputHeight())
      console.log('Output width:', newSelectedTFLite._getOutputWidth())
      console.log(
        'Output channels:',
        newSelectedTFLite._getOutputChannelCount()
      )

      setSelectedTFLite(newSelectedTFLite)
    }

    loadTFLiteModel()
  }, [
    tflite,
    tfliteSIMD,
    isSIMDSupported,
    segmentationConfig.model,
    segmentationConfig.backend,
    segmentationConfig.inputResolution,
  ])

  return { tflite: selectedTFLite, isSIMDSupported }
}

export default useTFLite
