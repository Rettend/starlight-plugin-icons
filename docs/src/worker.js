export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/starlight-plugin-icons/')) {
      url.pathname = url.pathname.replace(/^\/starlight-plugin-icons/, '')
      request = new Request(url, request)
    }

    return env.ASSETS.fetch(request)
  },
}
