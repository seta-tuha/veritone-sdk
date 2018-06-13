import { get, set, omit, without, union, merge, difference } from 'lodash';
import { helpers, modules } from 'veritone-redux-common';
const { createReducer } = helpers;
const { engine: engineModule } = modules;

export const INITIALIZE_WIDGET = 'vtn/engineSelection/INITIALIZE_WIDGET';

export const CHECK_ALL_ENGINES = 'vtn/engineSelection/CHECK_ALL_ENGINES';
export const UNCHECK_ALL_ENGINES = 'vtn/engineSelection/UNCHECK_ALL_ENGINES';

export const SELECT_ENGINE = 'vtn/engineSelection/SELECT_ENGINE';
export const DESELECT_ENGINE = 'vtn/engineSelection/DESELECT_ENGINE';

export const CHECK_ENGINE = 'vtn/engineSelection/CHECK_ENGINE';
export const UNCHECK_ENGINE = 'vtn/engineSelection/UNCHECK_ENGINE';

export const ADD_FILTER = 'vtn/engineSelection/ADD_FILTER';
export const REMOVE_FILTER = 'vtn/engineSelection/REMOVE_FILTER';
export const CLEAR_ALL_FILTERS = 'vtn/engineSelection/CLEAR_ALL_FILTERS';

export const SEARCH = 'vtn/engineSelection/SEARCH';
export const CLEAR_SEARCH = 'vtn/engineSelection/CLEAR_SEARCH';

export const CHANGE_TAB = 'vtn/engineSelection/CHANGE_TAB';
export const TOGGLE_SEARCH = 'vtn/engineSelection/TOGGLE_SEARCH';

export const SET_DESELECTED_ENGINES =
  'vtn/engineSelection/SET_DESELECTED_ENGINES';
export const SET_ALL_ENGINES_SELECTED =
  'vtn/engineSelection/SET_ALL_ENGINES_SELECTED';

export const namespace = 'engineSelection';

const defaultSelectionState = {
  searchResults: {},
  searchQuery: '',
  filters: {
    category: [],
    rating: []
  },
  orderBy: {},
  selectedEngineIds: [],
  checkedEngineIds: [],
  allEnginesChecked: false,
  currentTabIndex: 0,
  isSearchOpen: false,
  deselectedEngineIds: [],
  allEnginesSelected: false
};

const defaultState = {
  // populated like:
  // [pickerId]: { ...defaultPickerState }
};

export default createReducer(defaultState, {
  [INITIALIZE_WIDGET](state, action) {
    return {
      ...defaultState,
      [action.meta.id]: {
        ...defaultSelectionState
      }
    };
  },
  [engineModule.FETCH_ENGINES_SUCCESS](state, action) {
    const id = action.meta.id;
    const resultsPath = pathFor(action.meta.searchQuery, action.meta.filters);
    const normalizedResults = action.payload.results.map(engine => engine.id);
    const newResults = set({}, resultsPath, normalizedResults);

    /*
    * Check if engines in deselectedEngineIds
    * if so then ignore
    * otherwise add to selected
    */
    const selectedEngineIds = state[id].allEnginesSelected
      ? difference(normalizedResults, state[id].deselectedEngineIds)
      : [];

    return {
      ...state,
      [id]: {
        ...state[id],
        selectedEngineIds: [
          ...new Set([...state[id].selectedEngineIds, ...selectedEngineIds])
        ],
        searchResults: merge({}, state[id].searchResults, newResults)
      }
    };
  },
  [CHECK_ALL_ENGINES](state, action) {
    const id = action.meta.id;
    const engineIds = action.payload.engines;

    return {
      ...state,
      [id]: {
        ...state[id],
        checkedEngineIds: engineIds,
        allEnginesChecked: true
      }
    };
  },
  [UNCHECK_ALL_ENGINES](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [SELECT_ENGINE](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        selectedEngineIds: union(
          state[id].selectedEngineIds,
          action.payload.engineIds
        ),
        deselectedEngineIds: without(
          state[id].deselectedEngineIds,
          ...action.payload.engineIds
        ),
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [DESELECT_ENGINE](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        selectedEngineIds: without(
          state[id].selectedEngineIds,
          ...action.payload.engineIds
        ),
        deselectedEngineIds: union(
          state[id].deselectedEngineIds,
          action.payload.engineIds
        ),
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [CHECK_ENGINE](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        checkedEngineIds: union(state[id].checkedEngineIds, [
          action.payload.engineId
        ])
      }
    };
  },
  [UNCHECK_ENGINE](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        checkedEngineIds: without(
          state[id].checkedEngineIds,
          action.payload.engineId
        ),
        allEnginesChecked: false
      }
    };
  },
  [ADD_FILTER](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        filters: {
          ...state[id].filters,
          [action.payload.type]: action.payload.value
        },
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [REMOVE_FILTER](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        filters: omit(state[id].filters, action.payload.type),
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [CLEAR_ALL_FILTERS](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        filters: defaultSelectionState.filters,
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [SEARCH](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        searchQuery: action.payload.searchQuery,
        checkedEngineIds: [],
        allEnginesChecked: false
      }
    };
  },
  [CLEAR_SEARCH](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        searchQuery: '',
        checkedEngineIds: [],
        allEnginesChecked: false,
        isSearchOpen: false
      }
    };
  },
  [CHANGE_TAB](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        currentTabIndex: action.payload.tabIndex,
        searchQuery: '',
        isSearchOpen: false
      }
    };
  },
  [TOGGLE_SEARCH](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        isSearchOpen: !state[id].isSearchOpen
      }
    };
  },
  [SET_DESELECTED_ENGINES](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        deselectedEngineIds: action.payload.deselectedEngineIds
      }
    };
  },
  [SET_ALL_ENGINES_SELECTED](state, action) {
    const id = action.meta.id;
    return {
      ...state,
      [id]: {
        ...state[id],
        allEnginesSelected: action.payload.allEnginesSelected
      }
    };
  }
});

function local(state) {
  return state[namespace];
}

export function initializeWidget(id) {
  return {
    type: INITIALIZE_WIDGET,
    meta: { id }
  };
}

export function refetchEngines(id) {
  return function action(dispatch, getState) {
    const searchQuery = getSearchQuery(getState(), id);
    const filters = getEngineFilters(getState(), id);
    dispatch(
      engineModule.fetchEngines(
        { offset: 0, limit: 1000, owned: false },
        searchQuery,
        filters,
        {
          status: ['deployed']
        },
        id
      )
    );
  };
}

export function searchEngines(id, { name }) {
  return {
    type: SEARCH,
    payload: {
      searchQuery: name
    },
    meta: { id }
  };
}

export function addEngineFilter(id, { type, value }) {
  return {
    type: ADD_FILTER,
    payload: {
      type,
      value
    },
    meta: { id }
  };
}

export function removeEngineFilter(id, { type, value }) {
  return {
    type: REMOVE_FILTER,
    payload: {
      type,
      value
    },
    meta: { id }
  };
}

export function checkAllEngines(id, engines) {
  return {
    type: CHECK_ALL_ENGINES,
    payload: {
      engines
    },
    meta: { id }
  };
}

export function uncheckAllEngines(id) {
  return {
    type: UNCHECK_ALL_ENGINES,
    payload: {},
    meta: { id }
  };
}

export function selectEngines(id, engineIds) {
  return {
    type: SELECT_ENGINE,
    payload: {
      engineIds
    },
    meta: { id }
  };
}

export function deselectEngines(id, engineIds) {
  return {
    type: DESELECT_ENGINE,
    payload: {
      engineIds
    },
    meta: { id }
  };
}

export function checkEngine(id, engineId) {
  return {
    type: CHECK_ENGINE,
    payload: {
      engineId
    },
    meta: { id }
  };
}

export function uncheckEngine(id, engineId) {
  return {
    type: UNCHECK_ENGINE,
    payload: {
      engineId
    },
    meta: { id }
  };
}

export function clearSearch(id) {
  return {
    type: CLEAR_SEARCH,
    payload: {},
    meta: { id }
  };
}

export function clearAllFilters(id) {
  return {
    type: CLEAR_ALL_FILTERS,
    payload: {},
    meta: { id }
  };
}

export function changeTab(id, tabIndex) {
  return {
    type: CHANGE_TAB,
    payload: {
      tabIndex
    },
    meta: { id }
  };
}

export function toggleSearch(id) {
  return {
    type: TOGGLE_SEARCH,
    payload: {},
    meta: { id }
  };
}

export function setDeselectedEngineIds(id, deselectedEngineIds) {
  return {
    type: SET_DESELECTED_ENGINES,
    payload: {
      deselectedEngineIds
    },
    meta: { id }
  };
}

export function setAllEnginesSelected(id, allEnginesSelected) {
  return {
    type: SET_ALL_ENGINES_SELECTED,
    payload: {
      allEnginesSelected
    },
    meta: { id }
  };
}

export function pathFor(searchQuery, filters) {
  return [searchQuery, JSON.stringify(filters)];
}

export function getCurrentTabIndex(state, id) {
  return get(local(state), [id, 'currentTabIndex']);
}

export function isSearchOpen(state, id) {
  return get(local(state), [id, 'isSearchOpen']);
}

export function getCurrentResults(state, id) {
  const results = get(
    get(local(state), [id, 'searchResults']),
    pathFor(
      get(local(state), [id, 'searchQuery']),
      get(local(state), [id, 'filters'])
    )
  );
  return results;
}

export function getSearchQuery(state, id) {
  return get(local(state), [id, 'searchQuery']);
}

export function getEngineFilters(state, id) {
  return get(local(state), [id, 'filters']);
}

export function engineIsSelected(state, engineId, id) {
  return get(local(state), [id, 'selectedEngineIds']).includes(engineId);
}

export function engineIsChecked(state, engineId, id) {
  return get(local(state), [id, 'checkedEngineIds']).includes(engineId);
}

export function allEnginesChecked(state, id) {
  return get(local(state), [id, 'allEnginesChecked']);
}

export function getSelectedEngineIds(state, id) {
  return get(local(state), [id, 'selectedEngineIds']);
}

export function getDeselectedEngineIds(state, id) {
  return get(local(state), [id, 'deselectedEngineIds']);
}

export function getCheckedEngineIds(state, id) {
  return get(local(state), [id, 'checkedEngineIds']);
}
