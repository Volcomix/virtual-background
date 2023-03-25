import { useEffect, useRef } from 'react'

function Viewer() {
  const video = useRef<HTMLVideoElement>(null!)

  useEffect(() => {
    const peerConnection = new RTCPeerConnection()
    const signalingChannel = new BroadcastChannel('signaling-channel')

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      video.current.srcObject = remoteStream
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending caller ICE candidate')
        signalingChannel.postMessage(
          JSON.stringify({ iceCandidate: event.candidate })
        )
      }
    }

    signalingChannel.onmessage = async (event) => {
      const message = JSON.parse(event.data)
      if (message.answer) {
        console.log('Received answer')
        const remoteDesc = new RTCSessionDescription(message.answer)
        await peerConnection.setRemoteDescription(remoteDesc)
      } else if (message.iceCandidate) {
        console.log('Received callee ICE candidate')
        await peerConnection.addIceCandidate(message.iceCandidate)
      }
    }

    const sendOffer = async () => {
      console.log('Sending offer')
      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
      })
      await peerConnection.setLocalDescription(offer)
      signalingChannel.postMessage(JSON.stringify({ offer }))
    }

    sendOffer()

    return () => {
      peerConnection.close()
      signalingChannel.close()
    }
  }, [])

  return <video ref={video} autoPlay playsInline controls={false} muted />
}

export default Viewer
