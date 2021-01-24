export type SegmentationModel = 'bodyPix'

export type InputResolution = '360p' | '144p'

export const inputResolutions: {
  [resolution in InputResolution]: [number, number]
} = {
  '360p': [640, 360],
  '144p': [256, 144],
}

export type SegmentationConfig = {
  model: SegmentationModel
  inputResolution: InputResolution
}
