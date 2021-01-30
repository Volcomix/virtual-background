export type PostProcessingConfig = {
  smoothSegmentationMask: boolean
  jointBilateralFilter: JointBilateralFilterConfig
}

export type JointBilateralFilterConfig = {
  sigmaSpace: number
  sigmaColor: number
}
