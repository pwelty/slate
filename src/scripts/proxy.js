// Simple proxy to bypass CORS issues
export async function proxyFetch(url, options = {}) {
  // For now, we'll use a workaround with a public CORS proxy
  // In production, you'd want your own proxy server
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
  
  try {
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    return response
  } catch (error) {
    console.error('Proxy fetch failed:', error)
    throw error
  }
}