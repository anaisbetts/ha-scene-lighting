'use client';

import { useCommand, useObservable, usePromise } from "@anaisbetts/commands";
import { useState, useMemo, useRef } from "react";
import { Subject, throttleTime } from "rxjs";
import { clamp } from "../lib/math";
import { lerpScene, applySceneTransition } from "../lib/scene-lerp";
import { FriendlyStateHistoryEntity, Scene } from "../lib/shared-types";
import { SceneListBox } from "./scene-list";
import { SensorGraph } from "./sensor-graph";
import { SensorListBox } from "./sensor-list";
import { getSceneList, getSensorData } from "../lib/home-assistant-api";

/*
 * Graph Test
 */

export function GraphTestSection() {
  const [sensor, setSensor] = useState<FriendlyStateHistoryEntity>()
  const [_loadSensors, data] = useCommand(
    () => getSensorData(),
    [],
    true,
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
      <SensorListBox sensors={Object.values(data.ok()!)} onSensorSelect={setSensor} />
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

export function LerpTestSection({ initialSceneList }: LerpTestProps) {
  const rangeSubj = useRef(new Subject<number>())
  const [from, setFrom] = useState<Scene | undefined>()
  const [to, setTo] = useState<Scene | undefined>()

  const [_reload, content] = useCommand(
    () => getSceneList(),
    [],
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
