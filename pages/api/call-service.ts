import { NextApiRequest, NextApiResponse } from 'next'
import '../api-helper'

import {
  Scene,
  createHAApiHandler,
  CallServiceRequest,
} from '../../lib/home-assistant-api'
import { Axios } from 'axios'

export async function haCallService(
  api: Axios,
  requestData: CallServiceRequest
) {
  const { domain, service, entityId, data } = requestData

  const haResp = await api.post(`/services/${domain}/${service}`, {
    entity_id: entityId,
    //data,
    ...data,
  })

  if (haResp.status >= 400) {
    throw new Error(`Failed service call with ${haResp.status}: ${haResp.data}`)
  }

  return haResp
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Scene[]>
) {
  const api = createHAApiHandler()
  const haResp = await haCallService(
    api,
    req.body as CallServiceRequest
  )

  res.status(haResp.status).end(haResp.data)
}
