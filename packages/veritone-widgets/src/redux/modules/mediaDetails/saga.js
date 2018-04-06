import { fork, all, call, put, takeEvery, select } from 'redux-saga/effects';
import { get } from 'lodash';
import { modules } from 'veritone-redux-common';
const { auth: authModule, config: configModule } = modules;

import callGraphQLApi from '../../../shared/callGraphQLApi';
import {
  LOAD_ENGINE_RESULTS,
  LOAD_TDO,
  UPDATE_TDO,
  SET_SELECTED_ENGINE_ID,
  SELECT_ENGINE_CATEGORY,
  loadEngineCategoriesComplete,
  loadEngineResultsRequest,
  loadEngineResultsComplete,
  loadTdoSuccess,
  updateTdoComplete,
  selectEngineCategory,
  setEngineId,
  tdo,
  engineResultRequestsByEngineId
} from '.';

function* finishLoadEngineCategories(widgetId, result, { warning, error }) {
  yield put(loadEngineCategoriesComplete(widgetId, result, { warning, error }));
}

function* finishLoadTdo(widgetId, result, { warning, error }) {
  yield put(loadTdoSuccess(widgetId, result, { warning, error }));
}

function* finishUpdateTdo(widgetId, result, { warning, error }) {
  yield put(updateTdoComplete(widgetId, result, { warning, error }));
}

function* loadTdoSaga(widgetId, tdoId) {
  const getTdoQuery = `query temporalDataObject($tdoId: ID!){
      temporalDataObject(id: $tdoId) {
        id
        details
        startDateTime
        stopDateTime
        primaryAsset(assetType: "media") {
          id
          uri
        }
        jobs {
          records {
            tasks (limit: 1000, status: complete ) {
              records {
                completedDateTime
                engine {
                  id 
                  name
                  category {
                    id
                    name
                    iconClass
                    editable
                    categoryType
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const config = yield select(configModule.getConfig);
  const { apiRoot, graphQLEndpoint } = config;
  const graphQLUrl = `${apiRoot}/${graphQLEndpoint}`;
  const sessionToken = yield select(authModule.selectSessionToken);
  const oauthToken = yield select(authModule.selectOAuthToken);
  const token = sessionToken || oauthToken;

  let response;
  try {
    response = yield call(callGraphQLApi, {
      endpoint: graphQLUrl,
      query: getTdoQuery,
      variables: { tdoId },
      token
    });
  } catch (error) {
    return yield* finishLoadTdo(widgetId, null, { error });
  }

  if (!response || !response.data || !response.data.temporalDataObject) {
    console.warn('TemporalDataObject not found');
    return yield* finishLoadTdo(widgetId, response.data.temporalDataObject, {
      error: 'TemporalDataObject not found'
    });
  }

  let engineCategories = [];
  // array of categories that Media Details does not support
  let unsupportedResultCategories = [
    'conductor',
    'reducer',
    'thumbnail',
    'transcode',
    // TODO: remove these temporarily disabled categories
    'fingerprint',
    'translate',
    'geolocation',
    'stationPlayout',
    'music'
  ];

  // Convert data from tasks to EngineCategories
  // {
  //  name
  //  id
  //  editable
  //  iconClass
  //  categoryType
  //  engines [{
  //    id
  //    name
  //    completedDateTime
  //    }
  //  ]}
  const tdo = response.data.temporalDataObject;
  if (get(tdo, 'jobs.records', [])) {
    const engineCategoryById = new Map();
    // filter out unique engines per engine category
    tdo.jobs.records.forEach(job => {
      if (!job.tasks || !job.tasks.records) {
        return;
      }
      job.tasks.records
        .filter(
          task => get(task, 'engine.category.iconClass', false) &&
            !unsupportedResultCategories.some(
              categoryType => categoryType === task.engine.category.categoryType
            )
        )
        .forEach(task => {
          let engineCategory = engineCategoryById.get(task.engine.category.id);
          if (!engineCategory) {
            engineCategory = Object.assign({}, task.engine.category);
            engineCategory.iconClass = engineCategory.iconClass.replace(
              '-engine',
              ''
            );
            engineCategory.engines = [];
            engineCategoryById.set(engineCategory.id, engineCategory);
          }

          const engineFromTask = {};
          engineFromTask.id = task.engine.id;
          engineFromTask.name = task.engine.name;
          engineFromTask.completedDateTime = Number(task.completedDateTime);

          const filteredEngineIdx = engineCategory.engines.findIndex(
            filteredEngine => filteredEngine.id === engineFromTask.id
          );
          if (filteredEngineIdx === -1) {
            engineCategory.engines.push(engineFromTask);
          } else if (
            engineFromTask.completedDateTime >
            engineCategory.engines[filteredEngineIdx].completedDateTime
          ) {
            // consider only the latest run engine, disregard previous runs
            engineCategory.engines[filteredEngineIdx] = engineFromTask;
          }
        });
    });

    // list all categories
    const filteredCategories = [];
    const categoriesIterator = engineCategoryById.values();
    let nextCategory = categoriesIterator.next();
    while (!nextCategory.done) {
      filteredCategories.push(nextCategory.value);
      nextCategory = categoriesIterator.next();
    }
    engineCategories = filteredCategories;
  }

  // TODO: dynamically add Structured Data Category - depending whether there is such data for TDO
  engineCategories.push({
    name: 'Structured Data',
    id: 'thirdPartyData',
    categoryType: 'thirdPartyData',
    editable: false,
    iconClass: 'icon-third-party-data',
    engines: []
  });

  // order categories first must go most frequently used (ask PMs), the rest - alphabetically
  engineCategories.sort((category1, category2) => {
    if (category1.categoryType < category2.categoryType) {
      return -1;
    }
    if (category1.categoryType > category2.categoryType) {
      return 1;
    }
    return 0;
  });
  const orderedCategoryTypes = [
    'transcript',
    'face',
    'object',
    'logo',
    'ocr',
    'fingerprint',
    'translate',
    'sentiment',
    'geolocation',
    'stationPlayout',
    'thirdPartyData',
    'music'
  ];
  orderedCategoryTypes.reverse().forEach(orderedCategoryType => {
    const index = engineCategories.findIndex(
      category => category.categoryType === orderedCategoryType
    );
    if (index >= 0) {
      const category = engineCategories[index];
      engineCategories.splice(index, 1);
      engineCategories.unshift(category);
    }
  });

  delete tdo.jobs;

  yield* finishLoadTdo(widgetId, tdo, {
    warning: false,
    error: false
  });

  yield* finishLoadEngineCategories(widgetId, engineCategories, {
    warning: false,
    error: false
  });
  if (engineCategories.length) {
    yield put(selectEngineCategory(widgetId, engineCategories[0]));
  }
}

function* updateTdoSaga(widgetId, tdoId, tdoDataToUpdate) {
  const updateTdoQuery = `mutation updateTDO($tdoId: ID!){
      updateTDO( input: {
        id: $tdoId
        ${tdoDataToUpdate}
      })
      {
        id
        details
        startDateTime
        stopDateTime
        primaryAsset(assetType: "media") {
          id
          uri
        }
      }
    }`;

  const config = yield select(configModule.getConfig);
  const { apiRoot, graphQLEndpoint } = config;
  const graphQLUrl = `${apiRoot}/${graphQLEndpoint}`;
  const token = yield select(authModule.selectSessionToken);

  let response;
  try {
    response = yield call(callGraphQLApi, {
      endpoint: graphQLUrl,
      query: updateTdoQuery,
      variables: { tdoId },
      token
    });
  } catch (error) {
    return yield* finishUpdateTdo(widgetId, null, { error });
  }

  if (response.errors && response.errors.length) {
    response.errors.forEach(error => console.warn(error));
  }

  if (!response || !response.data || !response.data.updateTDO) {
    console.warn('TemporalDataObject not found after update');
  }

  yield* finishUpdateTdo(widgetId, response.data.updateTDO, {
    warning: false,
    error: false
  });
}

function* loadEngineResultsSaga(
  widgetId,
  engineId,
  startOffsetMs,
  stopOffsetMs
) {
  const getEngineResultsQuery = `query engineResults($tdoId: ID!, $engineIds: [ID!], $startOffsetMs: Int, $stopOffsetMs: Int) {
      engineResults(id: $tdoId, engineIds: $engineIds, startOffsetMs: $startOffsetMs, stopOffsetMs: $stopOffsetMs) {
        records {
          tdoId
          engineId
          startOffsetMs
          stopOffsetMs
          jsondata
        }
      }
    }`;

  const config = yield select(configModule.getConfig);
  const { apiRoot, graphQLEndpoint } = config;
  const graphQLUrl = `${apiRoot}/${graphQLEndpoint}`;
  const token = yield select(authModule.selectSessionToken);
  const requestTdo = yield select(tdo, widgetId);
  const variables = { tdoId: requestTdo.id, engineIds: [engineId] };
  if (startOffsetMs) {
    variables.startOffsetMs = startOffsetMs;
  }
  if (stopOffsetMs) {
    variables.stopOffsetMs = stopOffsetMs;
  }
  let response;
  try {
    response = yield call(callGraphQLApi, {
      endpoint: graphQLUrl,
      query: getEngineResultsQuery,
      variables: variables,
      token
    });
  } catch (error) {
    yield put(loadEngineResultsComplete(null, { error, widgetId }));
  }

  yield put(
    loadEngineResultsComplete(response.data.engineResults.records, {
      warning: false,
      error: false,
      startOffsetMs,
      stopOffsetMs,
      widgetId
    })
  );
}

function* watchLoadEngineResultsRequest() {
  yield takeEvery(LOAD_ENGINE_RESULTS, function*(action) {
    const { engineId } = action.payload;
    let { startOffsetMs, stopOffsetMs } = action.payload;
    const { widgetId } = action.meta;

    yield call(
      loadEngineResultsSaga,
      widgetId,
      engineId,
      startOffsetMs,
      stopOffsetMs
    );
  });
}

function* watchLoadTdoRequest() {
  yield takeEvery(LOAD_TDO, function*(action) {
    const { tdoId } = action.payload;
    const { widgetId } = action.meta;
    yield call(loadTdoSaga, widgetId, tdoId);
  });
}

function* watchUpdateTdoRequest() {
  yield takeEvery(UPDATE_TDO, function*(action) {
    const { tdoId, tdoDataToUpdate } = action.payload;
    const { widgetId } = action.meta;
    yield call(updateTdoSaga, widgetId, tdoId, tdoDataToUpdate);
  });
}

function* watchSetEngineId() {
  yield takeEvery(SET_SELECTED_ENGINE_ID, function*(action) {
    const selectedEngineId = action.payload;
    const { widgetId } = action.meta;

    if (!selectedEngineId) {
      return;
    }

    // TODO: Currently fetching the entire tdo assets. Will eventually use mediaplayer time etc to fetch the required data
    const currentTdo = yield select(tdo, widgetId);
    const startOfTdo = new Date(currentTdo.startDateTime).getTime();
    const endOfTdo = new Date(currentTdo.stopDateTime).getTime();
    let startOffsetMs, stopOffsetMs;
    if (!startOffsetMs) {
      startOffsetMs = 0;
    }
    if (!stopOffsetMs) {
      stopOffsetMs = endOfTdo - startOfTdo;
    }

    let engineResultRequests = yield select(
      engineResultRequestsByEngineId,
      widgetId,
      selectedEngineId
    );
    let resultsInTimeBounds = engineResultRequests.filter(result => {
      return (
        (result.startOffsetMs >= startOffsetMs &&
          result.startOffsetMs <= stopOffsetMs) ||
        (result.startOffsetMs >= startOffsetMs &&
          result.startOffsetMs <= stopOffsetMs)
      );
    });

    // TODO: Optimize this to get all gaps not just the first
    if (resultsInTimeBounds.length === 1) {
      if (resultsInTimeBounds[0].startOffsetMs > startOffsetMs) {
        stopOffsetMs = resultsInTimeBounds[0].startOffsetMs - 1;
      } else {
        startOffsetMs = resultsInTimeBounds[0].stopOffsetMs + 1;
      }
    } else if (resultsInTimeBounds.length > 1) {
      startOffsetMs = resultsInTimeBounds[0].stopOffsetMs + 1;
      stopOffsetMs = resultsInTimeBounds[1].startOffsetMs - 1;
    }

    if (startOffsetMs > stopOffsetMs) {
      return;
    }

    yield put(
      loadEngineResultsRequest(
        widgetId,
        selectedEngineId,
        startOffsetMs,
        stopOffsetMs
      )
    );
  });
}

function* watchSelectEngineCategory() {
  yield takeEvery(SELECT_ENGINE_CATEGORY, function*(action) {
    const { engines } = action.payload;
    const { widgetId } = action.meta;
    const engineId = engines.length ? engines[0].id : undefined;

    yield put(setEngineId(widgetId, engineId));
  });
}

export default function* root() {
  yield all([
    fork(watchLoadEngineResultsRequest),
    fork(watchLoadTdoRequest),
    fork(watchUpdateTdoRequest),
    fork(watchSetEngineId),
    fork(watchSelectEngineCategory)
  ]);
}
