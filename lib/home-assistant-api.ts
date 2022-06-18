import { Axios } from "axios";

export interface HAState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: Date;
  last_updated: Date;
  context: HAStateContext;
}

export interface HAStateContext {
  id: string;
  parent_id: null;
  user_id: null;
}

export interface FriendlyEntity {
  entity: string;
  name: string;
}

export interface Scene extends FriendlyEntity {
  affects: FriendlyEntity[];
}

export function HAStateToFriendlyEntity(state: HAState): FriendlyEntity {
  return {
    entity: state.entity_id,
    name: state.attributes.friendly_name || state.entity_id,
  };
}

export async function getHAStates(api: Axios) {
  const ret = await api.get("/states");

  console.log(ret.data);
  return JSON.parse(ret.data) as HAState[];
}

export async function getSceneList(api: Axios) {
  const result = await getHAStates(api);

  const entityTable = result.reduce((acc, x) => {
    acc[x.entity_id] = x;
    return acc;
  }, {} as Record<string, HAState>);

  return result
    .filter((x) => x.entity_id.startsWith("scene."))
    .map((x) => {
      const ret: Scene = {
        entity: x.entity_id,
        name: x.attributes.friendly_name,
        affects: x.attributes.entity_id.map((id: string) =>
          HAStateToFriendlyEntity(entityTable[id])
        ),
      };

      return ret;
    });
}
