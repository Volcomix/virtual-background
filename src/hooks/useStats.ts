import { useCallback, useRef, useState } from 'react'

function useStats() {
  const [fps, setFps] = useState(0)
  const [durations, setDurations] = useState<number[]>([])
  const previousTimeRef = useRef(0)
  const beginTimeRef = useRef(0)
  const durationsRef = useRef<number[]>([])
  const eventCount = useRef(0)
  const frameCountRef = useRef(0)

  // The useCallbacks below are required to prevent infinite loop
  // when the functions are called inside useEffect

  const beginFrame = useCallback(() => {
    beginTimeRef.current = Date.now()
  }, [])

  const addFrameEvent = useCallback(() => {
    const time = Date.now()
    durationsRef.current[eventCount.current] = time - beginTimeRef.current
    beginTimeRef.current = time
    eventCount.current++
  }, [])

  const endFrame = useCallback(() => {
    const time = Date.now()
    durationsRef.current[eventCount.current] = time - beginTimeRef.current
    frameCountRef.current++
    if (time >= previousTimeRef.current + 1000) {
      setFps((frameCountRef.current * 1000) / (time - previousTimeRef.current))
      setDurations(durationsRef.current)
      previousTimeRef.current = time
      frameCountRef.current = 0
    }
    eventCount.current = 0
  }, [])

  return { fps, durations, beginFrame, addFrameEvent, endFrame }
}

export default useStats
