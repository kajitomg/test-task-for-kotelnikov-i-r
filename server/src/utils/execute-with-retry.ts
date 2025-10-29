interface RetryConfig {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  exponential?: boolean
  jitter?: boolean
  onRetry?: (attempt: number, error: any, delay: number) => void
}

async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 10,
    maxDelay = 200,
    exponential = true,
    jitter = true,
    onRetry
  } = config
  
  let lastError: any
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now()
      const result = await operation()
      
      if (attempt > 0) {
        console.log(`Успех после ${attempt + 1} попыток (${Date.now() - startTime}мс)`)
      }
      
      return result
    } catch (error: any) {
      lastError = error
      
      const isLastAttempt = attempt === maxRetries - 1
      const isRetryable =
        error.code === 'P2034' ||
        error.code === '40001' ||
        error.message?.includes('write conflict') ||
        error.message?.includes('deadlock')
      
      if (!isRetryable || isLastAttempt) {
        throw error
      }
      
      let delay = exponential
        ? initialDelay * Math.pow(2, attempt)
        : initialDelay
      
      delay = Math.min(delay, maxDelay)
      
      if (jitter) {
        const jitterRange = delay * 0.3
        delay = delay + (Math.random() * jitterRange * 2 - jitterRange)
      }
      
      onRetry?.(attempt + 1, error, delay)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export { executeWithRetry }