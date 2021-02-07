export type SegmentationModel = 'bodyPix' | 'meet'
export type SegmentationBackend = 'webgl' | 'wasm' | 'wasmSimd'
export type InputResolution = '360p' | '144p' | '96p'

export const inputResolutions: {
  [resolution in InputResolution]: [number, number]
} = {
  '360p': [640, 360],
  '144p': [256, 144],
  '96p': [160, 96],
}

export type PipelineName = 'canvas2dCpu' | 'webgl2'

export type SegmentationConfig = {
  model: SegmentationModel
  backend: SegmentationBackend
  inputResolution: InputResolution
  pipeline: PipelineName
}
