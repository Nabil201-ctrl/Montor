const axios = require('axios');

/**
 * Creates a configured axios instance with retries and timeouts
 * to handle flaky connections (like EAI_AGAIN and timeouts).
 */
const githubAxios = axios.create({
  timeout: 15000, // 15 second timeout
});

// Simple retry interceptor
githubAxios.interceptors.response.use(null, async (error) => {
  const { config, message } = error;
  
  // If config does not exist or retry option is not set, reject
  if (!config || !config.retry) {
    return Promise.reject(error);
  }

  // Check if it's a transient error (timeout or DNS)
  const isTransientError = 
    message.includes('timeout') || 
    message.includes('EAI_AGAIN') || 
    message.includes('ECONNRESET') ||
    (error.response && error.response.status >= 500);

  if (isTransientError && config.retryCount < config.retry) {
    config.retryCount = config.retryCount || 0;
    config.retryCount += 1;

    const delay = config.retryDelay || 1000;
    console.log(`[GitHub Client] Retrying request (${config.retryCount}/${config.retry}) due to: ${message}`);
    
    // Wait for the delay
    await new Promise(resolve => setTimeout(resolve, delay * config.retryCount));
    
    return githubAxios(config);
  }

  return Promise.reject(error);
});

module.exports = { githubAxios };
