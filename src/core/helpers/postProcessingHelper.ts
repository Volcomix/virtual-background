export type PostProcessingConfig = {
  smoothSegmentationMask: boolean
  jointBilateralFilter: JointBilateralFilterConfig
  coverage: [number, number]
}

export type JointBilateralFilterConfig = {
  sigmaSpace: number
  sigmaColor: number
}
