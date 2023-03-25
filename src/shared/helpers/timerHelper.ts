type TimerData = {
  callbackId: number
}

export type TimerWorker = {
  setTimeout(callback: () => void, timeoutMs?: number): number
  clearTimeout(callbackId: number): void
  terminate(): void
}

export function createTimerWorker(): TimerWorker {
  const callbacks = new Map<number, () => void>()

  const worker = new Worker(new URL('./timerWorker', import.meta.url))

  worker.onmessage = (event: MessageEvent<TimerData>) => {
    const callback = callbacks.get(event.data.callbackId)
    if (!callback) {
      return
    }
    callbacks.delete(event.data.callbackId)
    callback()
  }

  let nextCallbackId = 1

  function setTimeout(callback: () => void, timeoutMs: number = 0) {
    const callbackId = nextCallbackId++
    callbacks.set(callbackId, callback)
    worker.postMessage({ callbackId, timeoutMs })
    return callbackId
  }

  function clearTimeout(callbackId: number) {
    if (!callbacks.has(callbackId)) {
      return
    }
    worker.postMessage({ callbackId })
    callbacks.delete(callbackId)
  }

  function terminate() {
    callbacks.clear()
    worker.terminate()
  }

  return { setTimeout, clearTimeout, terminate }
}
