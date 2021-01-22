import { useEffect } from 'react'
import { SourcePlayback } from '../helpers/sourceHelper'

type OutputViewerProps = {
  sourcePlayback: SourcePlayback
}

function OutputViewer(props: OutputViewerProps) {
  useEffect(() => {
    console.log('Received source playback:', props.sourcePlayback.htmlElement)
  }, [props.sourcePlayback])

  return <canvas />
}

export default OutputViewer
