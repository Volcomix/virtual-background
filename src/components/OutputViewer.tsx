import { useEffect } from 'react'
import { SourceRef } from '../helpers/sourceHelper'

type OutputViewerProps = {
  sourceRef: SourceRef
}

function OutputViewer(props: OutputViewerProps) {
  useEffect(() => {
    console.log('Loading:', props.sourceRef.source.src)
  }, [props.sourceRef])

  return <canvas />
}

export default OutputViewer
