export type RenderingPipeline = {
  render: () => Promise<void>
  cleanUp: () => void
}
