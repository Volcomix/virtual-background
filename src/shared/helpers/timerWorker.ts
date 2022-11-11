declare const self: DedicatedWorkerGlobalScope

type TimerData = {
  callbackId: number
  timeoutMs?: number
}

const timeoutIds = new Map<number, number>()

self.onmessage = (event: MessageEvent<TimerData>) => {
  if (event.data.timeoutMs !== undefined) {
    const timeoutId = self.setTimeout(() => {
      self.postMessage({ callbackId: event.data.callbackId })
      timeoutIds.delete(event.data.callbackId)
    }, event.data.timeoutMs)
    timeoutIds.set(event.data.callbackId, timeoutId)
  } else {
    const timeoutId = timeoutIds.get(event.data.callbackId)
    self.clearTimeout(timeoutId)
    timeoutIds.delete(event.data.callbackId)
  }
}

export {}
