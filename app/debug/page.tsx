import { getHASensorDetails, getSceneList } from "../../lib/home-assistant-api"
import { GraphTestSection, LerpTestSection } from "../../components/debug"
import { sub } from "date-fns";

async function getRangeForSensor(sensor: string) {
  const since = sub(new Date(), { days: 3 });
  const sensorHistory = await getHASensorDetails([sensor], since);
  const tenPct = Math.floor(sensorHistory[0].length * 0.2)

  const values = sensorHistory[0].map((x) => Number.parseFloat(x.state)).sort((a,b) => a-b).splice(tenPct, sensorHistory[0].length - tenPct*2)
  console.log(JSON.stringify(values))

  return values.reduce((acc, val) => {
    if (val < acc.min) {
      acc.min = val
    }

    if (val > acc.max) {
      acc.max = val
    }

    return acc
  }, {min: 120394203948, max: -1020938493})
}

export default async function DebugPage() {
  const sceneList = await getSceneList()

  const since = sub(new Date(), { days: 3 });
  const range = await getRangeForSensor('sensor.outdoor_light_illuminance');

  return (
    <>
      <GraphTestSection />
      <LerpTestSection initialSceneList={sceneList} />
      <p>
        Sensor Data: {JSON.stringify(range, null, 2)}
      </p>
    </>
  )
}