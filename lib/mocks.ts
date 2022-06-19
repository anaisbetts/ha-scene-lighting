import { FriendlyStateEntity } from './home-assistant-api'

export const testOneFrom: FriendlyStateEntity = {
  entity: 'light.office_lamp_left',
  name: 'Office Lamp Left',
  state: {
    min_mireds: 153,
    max_mireds: 500,
    effect_list: ['None', 'candle', 'fire'],
    supported_color_modes: ['color_temp', 'xy'],
    mode: 'normal',
    dynamics: 'none',
    friendly_name: 'Office Lamp Left',
    supported_features: 44,
    color_mode: 'color_temp',
    brightness: 89,
    color_temp: 382,
    hs_color: [28.583, 68.442],
    rgb_color: [255, 163, 80],
    xy_color: [0.535, 0.388],
    effect: 'None',
    state: 'on',
  },
}

export const testOneTo: FriendlyStateEntity = {
  entity: 'light.office_lamp_left',
  name: 'Office Lamp Left',
  state: {
    min_mireds: 153,
    max_mireds: 500,
    effect_list: ['None', 'candle', 'fire'],
    supported_color_modes: ['color_temp', 'xy'],
    mode: 'normal',
    dynamics: 'none',
    friendly_name: 'Office Lamp Left',
    supported_features: 44,
    color_mode: 'color_temp',
    brightness: 250,
    color_temp: 196,
    hs_color: [27.12, 17.875],
    rgb_color: [255, 230, 209],
    xy_color: [0.368, 0.349],
    effect: 'None',
    state: 'on',
  },
}

export const testTwoFrom: FriendlyStateEntity = {
  entity: 'light.office_lamp_right',
  name: 'Office Lamp Right',
  state: {
    min_mireds: 153,
    max_mireds: 500,
    effect_list: ['None', 'candle', 'fire'],
    supported_color_modes: ['color_temp', 'xy'],
    mode: 'normal',
    dynamics: 'none',
    friendly_name: 'Office Lamp Right',
    supported_features: 44,
    color_mode: 'color_temp',
    brightness: 82,
    color_temp: 382,
    hs_color: [28.583, 68.442],
    rgb_color: [255, 163, 80],
    xy_color: [0.535, 0.388],
    effect: 'None',
    state: 'on',
  },
}

export const testTwoTo: FriendlyStateEntity = {
  entity: 'light.office_lamp_right',
  name: 'Office Lamp Right',
  state: {
    min_mireds: 153,
    max_mireds: 500,
    effect_list: ['None', 'candle', 'fire'],
    supported_color_modes: ['color_temp', 'xy'],
    mode: 'normal',
    dynamics: 'none',
    friendly_name: 'Office Lamp Right',
    supported_features: 44,
    color_mode: 'color_temp',
    brightness: 209,
    color_temp: 200,
    hs_color: [27.001, 19.243],
    rgb_color: [255, 228, 205],
    xy_color: [0.372, 0.35],
    effect: 'None',
    state: 'on',
  },
}

export const onOffTestFrom: FriendlyStateEntity = {
  entity: 'light.office_overhead_light',
  name: 'Overhead Light',
  state: {
    supported_color_modes: ['brightness'],
    friendly_name: 'Overhead Light',
    supported_features: 32,
    state: 'off',
  },
}

export const onOffTestTo: FriendlyStateEntity = {
  entity: 'light.office_overhead_light',
  name: 'Overhead Light',
  state: {
    supported_color_modes: ['brightness'],
    friendly_name: 'Overhead Light',
    supported_features: 32,
    color_mode: 'brightness',
    brightness: 181,
    state: 'on',
  },
}
