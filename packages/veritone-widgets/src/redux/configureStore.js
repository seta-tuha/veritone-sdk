import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import {
  getBaseMiddlewares,
  getDevOnlyMiddlewares
} from './store';
import createRootReducer from './rootReducer';
import rootSaga from './rootSaga';

// Redux devtools browser extension hook
// this has no effect unless the user has the chrome devtools extension installed.
// https://medium.com/@zalmoxis/using-redux-devtools-in-production-4c5b56c5600f
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMiddleware = createSagaMiddleware();

const enhancer = composeEnhancers(
  applyMiddleware(
    ...getBaseMiddlewares(),
    ...getDevOnlyMiddlewares(),
    sagaMiddleware
  )
);

export default function configureStore(initialState) {
  const store = {
    ...createStore(createRootReducer(), initialState, enhancer),
    asyncReducers: {},
    runSaga: sagaMiddleware.run,
    sagaMiddleware
    // close: () => store.dispatch(END);
  };

  store.runSaga(rootSaga);

  return store;
}
