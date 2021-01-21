import { useEffect } from 'react'

type OutputViewerProps = {
  source: HTMLImageElement | HTMLVideoElement
}

function OutputViewer(props: OutputViewerProps) {
  useEffect(() => {
    // FIXME Source change is not always detected
    console.log('Loading:', props.source.src)
  }, [props.source.src])

  return <canvas />
}

export default OutputViewer
