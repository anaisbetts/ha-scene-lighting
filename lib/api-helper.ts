import WebSocket from 'ws'

const wnd: any = globalThis
wnd.WebSocket = WebSocket

export const [homeAssistantUrl, homeAssistantToken] = [
  process.env.HA_BASE_URL!,
  process.env.HA_TOKEN!,
]
