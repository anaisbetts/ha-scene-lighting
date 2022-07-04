import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { FriendlyStateHistoryEntity } from '../lib/shared-types'

export interface SensorGraphProps {
  sensor: FriendlyStateHistoryEntity
  width?: number
  height?: number
}

export function SensorGraph({ sensor, width, height }: SensorGraphProps) {
  const last = Date.parse(
    sensor.history[sensor.history.length - 1].last_changed
  )
  const plotData = sensor.history.map(({ state, last_changed }) => ({
    x: Date.parse(last_changed) - last,
    y: parseFloat(state),
  }))

  const tf = (n: number) => {
    const h = n / 1000 / 60 / 60
    if (Math.abs(h) < 0.01) {
      return 'Now'
    }

    return `${h.toFixed(1)}h`
  }

  return (
    <LineChart width={width ?? 640} height={height ?? 300} data={plotData}>
      <Line type="monotone" dataKey="y" stroke="#ff7300" />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <Tooltip labelFormatter={tf} />
      <YAxis />
      <XAxis dataKey="x" tickFormatter={tf} />
    </LineChart>
  )
}
