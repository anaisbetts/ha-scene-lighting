import { NextApiRequest, NextApiResponse } from 'next'
import '../../lib/api-helper'

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

  const body = {
    entity_id: entityId,
    //data,
    ...data,
  }
  console.log(
    `FOR REAL CALLING SERVICE ${domain}.${service}: ${JSON.stringify(body)}`
  )
  const haResp = await api.post(`/services/${domain}/${service}`, body)

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
  const haResp = await haCallService(api, req.body as CallServiceRequest)

  res.status(haResp.status).json(haResp.data)
}
