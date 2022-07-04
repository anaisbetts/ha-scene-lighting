import axios from 'axios'

export async function fetchLocalApi<T>(url: string): Promise<T> {
  const api = axios.create()
  const response = await api.get(url)

  return response.data as T
}

export interface CallServiceRequest {
  domain: string
  service: string
  entityId: string
  data: Record<string, any>
}

export async function callService(
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, any>
) {
  const api = axios.create({ baseURL: '/' })
  const rqData: CallServiceRequest = {
    domain,
    service,
    entityId,
    data,
  }

  const response = await api.post('api/call-service', rqData)
  return response.data
}

const wnd: any = globalThis
wnd.fetchLocalApi = fetchLocalApi
