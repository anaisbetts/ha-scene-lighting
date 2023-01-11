// Background job needs to:
//
// - Be serializable
// - Be restartable, optionally with new data
// - Watches out-of-band light changes and uses them as overrides
// - Set up an API to clear current overrides list (just call restart?)

import * as path from 'path'

let sp: string

function serializationPath() {
  if (sp) return sp

  // NB: Accessing process.env can actually be stupidly slow
  return (sp = path.join(process.env.HA_LIGHTING_ROOT ?? '.', 'storage.json'))
}

export async function start() {
  // Connect to HA
  // Foreach scene pair:
  // - Subscribe to sensor and affected lights/switches
}

export async function stop() {}
