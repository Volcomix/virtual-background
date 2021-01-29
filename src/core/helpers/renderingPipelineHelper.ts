export type RenderingPipeline = {
  run: () => Promise<void>
  cleanUp: () => void
}
