import { sub } from 'date-fns';
import { NextResponse } from 'next/server';
import { getHAEntityDetails, getSceneList } from '../../../lib/home-assistant-api';
import { normalize } from '../../../lib/math';
import { applySceneTransition, lerpScene } from '../../../lib/scene-lerp';

async function getRangeForSensor(sensor: string) {
  const since = sub(new Date(), { days: 3 });
  const [sensorHistory] = await getHAEntityDetails([sensor], since);
  const tenPct = Math.floor(sensorHistory.length * 0.2)

  const values = sensorHistory.map((x) => Number.parseFloat(x.state)).sort((a,b) => a-b).splice(tenPct, sensorHistory.length - tenPct*2)
  const last = sensorHistory[sensorHistory.length - 1]

  return values.reduce((acc, val) => {
    if (val < acc.min) {
      acc.min = val
    }

    if (val > acc.max) {
      acc.max = val
    }

    return acc
  }, {min: 120394203948, max: -1020938493, current: Number.parseFloat(last.state)})
}

async function lerpSceneWithSensor(from: string, to: string, sensor: string) {
  const sceneList = await getSceneList()

  const range = await getRangeForSensor(sensor);
  const lerpVal = normalize(range.min, range.current, range.max)

  const fromScene = sceneList.find((x) => x.entity === from)!
  const toScene = sceneList.find((x) => x.entity === to)!

  const toLerp = lerpScene(fromScene, toScene, lerpVal)
  await applySceneTransition(toLerp)
}


export async function POST() {
  return NextResponse.json({ message: "Hello world" });
}
