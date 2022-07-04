import { useCallback } from 'react'
import { FriendlyStateHistoryEntity } from '../lib/shared-types'

import ListBox from './list-box'

const nanRe = /NaN/
function SensorTile({ item }: { item: FriendlyStateHistoryEntity }) {
  let examples = item.history
    .slice(0, 5)
    .map((x) => parseFloat(x.state))
    .join(', ')

  if (nanRe.test(examples)) {
    examples = '(invalid data)'
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateRows: 'auto', gridTemplateColumns: '1fr 1fr' }}
    >
      <span className="font-semibold row-span-2">{item.name}</span>
      <span className="italic">{examples}...</span>
    </div>
  )
}

export interface SensorListBoxProps {
  sensors: FriendlyStateHistoryEntity[]
  label?: string
  onSensorSelect?: (s: FriendlyStateHistoryEntity | undefined) => unknown
}

export function SensorListBox({
  sensors,
  label,
  onSensorSelect,
}: SensorListBoxProps) {
  const sensorLbi = sensors
    .map((x, n) => ({
      id: n,
      summary: x.name,
      content: <SensorTile item={x} />,
    }))
    .sort((a, b) => a.summary.localeCompare(b.summary))

  const idxSel = useCallback(
    (n: number | undefined) => {
      if (!n || n < 0) {
        onSensorSelect?.(undefined)
        return
      } else {
        onSensorSelect?.(sensors[n])
      }
    },
    [onSensorSelect, sensors]
  )

  return (
    <ListBox
      label={label ?? 'Sensors'}
      items={sensorLbi}
      onItemSelect={idxSel}
    />
  )
}
