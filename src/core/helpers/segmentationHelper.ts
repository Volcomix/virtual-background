export type SegmentationModel = 'bodyPix' | 'meet'

export type InputResolution = '360p' | '144p' | '96p'

export const inputResolutions: {
  [resolution in InputResolution]: [number, number]
} = {
  '360p': [640, 360],
  '144p': [256, 144],
  '96p': [160, 96],
}

export type Pipeline = 'canvas2dCpu' | 'webgl2'

export type SegmentationConfig = {
  model: SegmentationModel
  inputResolution: InputResolution
  pipeline: Pipeline
}
