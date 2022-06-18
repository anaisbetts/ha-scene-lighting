import type { NextApiRequest, NextApiResponse } from "next";

import {
  createLongLivedTokenAuth,
  createConnection,
} from "home-assistant-js-websocket";

import { homeAssistantUrl, homeAssistantToken } from "./credentials";

const wnd: any = globalThis;
wnd.WebSocket = require("ws");

async function doIt() {
  const auth = createLongLivedTokenAuth(homeAssistantUrl, homeAssistantToken);

  const conn = await createConnection({ auth });
  await conn.ping();
}

doIt().then(
  (_) => console.log("It worked!"),
  (e) => console.error(`oh geez: ${e.message}`, e)
);

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: "John Doe" });
}
