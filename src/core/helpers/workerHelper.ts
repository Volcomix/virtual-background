const WORKER_SCRIPT = `
    onmessage = function(evt) { 
        setTimeout(() => postMessage(evt.data.id), evt.data.timeout); 
    };`;

let timeoutWorker: Worker;

/**
 * setTimeout in worker context because browser does not throttle it in background mode
 */
export function requestWorkerTimeout(func: () => void, timeout: number = 0) {
    if (!timeoutWorker) {
        timeoutWorker = new Worker(URL.createObjectURL(new Blob([WORKER_SCRIPT], {type: "application/javascript"})));
    }
    const id = Math.random();
    const listener = (evt: MessageEvent) => {
        if (evt.data === id) {
            timeoutWorker.removeEventListener("message", listener);
            func();
        }
    };
    timeoutWorker.addEventListener("message", listener);
    timeoutWorker.postMessage({timeout, id});
}
