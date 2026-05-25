const inFlightRequests = new Map();

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    const abort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Request aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        abort();
        return;
      }

      signal.addEventListener("abort", abort, { once: true });
    }
  });
}

async function runWithRetry(loader, options) {
  const retries = options.retries ?? 0;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await loader();
    } catch (error) {
      if (error?.name === "AbortError" || attempt === retries) {
        throw error;
      }
      attempt += 1;
    }
  }
}

export function requestMock(key, loader, options = {}) {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = runWithRetry(async () => {
    await wait(options.delay ?? 300, options.signal);
    return loader();
  }, options).finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

export async function updateMock(loader, options = {}) {
  await wait(options.delay ?? 200, options.signal);
  return loader();
}