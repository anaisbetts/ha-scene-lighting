import { useMemo, useRef, useState } from 'react'
import { NextPage } from 'next'

import Shell from '../components/shell'
import { Subject, throttleTime } from 'rxjs'
import { useCommand, useObservable, usePromise } from '@anaisbetts/commands'
import { clamp } from '../lib/math'
import { lerpScene, applySceneTransition } from '../lib/scene-lerp'
import { SensorGraph } from '../components/sensor-graph'
import { SensorListBox } from '../components/sensor-list'
import { SceneListBox } from '../components/scene-list'
import { fetchLocalApi } from '../lib/api-client'
import { createHAApiHandler, getSceneList } from '../lib/home-assistant-api'
import { FriendlyStateHistoryEntity, Scene } from '../lib/shared-types'

/*
 * Graph Test
 */

function GraphTestSection() {
  const [sensor, setSensor] = useState<FriendlyStateHistoryEntity>()
  const [_loadSensors, data] = useCommand(
    () => fetchLocalApi<FriendlyStateHistoryEntity[]>('/api/get-sensor'),
    [],
    true
  )

  const graphContent = useMemo(() => {
    if (!sensor) return null

    return <SensorGraph sensor={sensor} />
  }, [sensor])

  if (data.isPending() || !data.ok()) {
    return <p>Loading...</p>
  }

  if (data.isErr()) {
    return <p>Error: {data.err().toString()}</p>
  }

  return (
    <>
      <h2>Graph Test</h2>
      <SensorListBox sensors={data.ok()!} onSensorSelect={setSensor} />
      <div>{graphContent}</div>
    </>
  )
}

/*
 * Lerp Test
 */

interface LerpTestProps {
  initialSceneList: Scene[]
}

function LerpTestSection({ initialSceneList }: LerpTestProps) {
  const rangeSubj = useRef(new Subject<number>())
  const [from, setFrom] = useState<Scene | undefined>()
  const [to, setTo] = useState<Scene | undefined>()

  const [_reload, content] = useCommand(
    () => fetchLocalApi<Scene[]>('/api/get-scene'),
    []
  )

  const scene = content.isOk()
    ? content.ok()! || initialSceneList
    : initialSceneList

  const val = useObservable(() => rangeSubj.current.pipe(throttleTime(250)), [])

  const lerpedSceneInfo = useMemo(() => {
    if (from === undefined || to === undefined || val.ok() === undefined) {
      return null
    }

    return lerpScene(from, to, clamp(0, val.ok()! / 100, 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, val, val.ok(), scene])

  usePromise(async () => {
    if (!lerpedSceneInfo) {
      return null
    }

    await applySceneTransition(lerpedSceneInfo)
  }, [lerpedSceneInfo])

  return (
    <>
      <h2>Lerp Test</h2>
      <SceneListBox sceneList={scene} label="From" onSceneSelect={setFrom} />
      <SceneListBox sceneList={scene} label="To" onSceneSelect={setTo} />

      <div>
        <input
          type="range"
          min="0"
          max="100"
          disabled={from === undefined || to === undefined}
          onChange={(e) => rangeSubj.current.next(Number(e.target.value))}
        />
        <p>{val.ok()}</p>
      </div>
    </>
  )
}

/*
 * Page Root
 */

interface DebugPageProps {
  initialSceneList: Scene[]
}

const DebugPage: NextPage<DebugPageProps> = ({ initialSceneList }) => {
  return (
    <Shell title="Debug Page">
      <GraphTestSection />
      <LerpTestSection initialSceneList={initialSceneList} />
    </Shell>
  )
}

DebugPage.getInitialProps = async () => {
  // NB: Because this method is guaranteed to be run server-side, we can make
  // web calls that we could not do otherwise!
  const api = createHAApiHandler(
    process.env.HA_BASE_URL!,
    process.env.HA_TOKEN!
  )

  return {
    initialSceneList: await getSceneList(api),
  }
}

export default DebugPage
