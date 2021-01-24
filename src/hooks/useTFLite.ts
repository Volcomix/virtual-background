import { useEffect, useState } from 'react'

declare function createTFLiteModule(): Promise<TFLite>

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

function useTFLite() {
  const [tflite, setTFLite] = useState<TFLite>()

  useEffect(() => {
    // TODO Detect WASM features to handle SIMD and multithreading
    async function loadTFLite() {
      setTFLite(await createTFLiteModule())
    }

    loadTFLite()
  }, [])

  return tflite
}

export default useTFLite
