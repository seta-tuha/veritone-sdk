import { combineReducers } from 'redux';
import { modules } from 'veritone-redux-common';

import filePickerReducer, {
  namespace as filePickerNamespace
} from './modules/filePicker';

import mediaDetailsReducer, {
  namespace as mediaDetailsNamespace
} from './modules/mediaDetails';

const {
  user: { reducer: userReducer, namespace: userNamespace },
  config: { reducer: configReducer, namespace: configNamespace },
  auth: { reducer: authReducer, namespace: authNamespace }
} = modules;

import appReducer, { namespace as appNamespace } from './modules/veritoneApp';

export default function createReducer(asyncReducers) {
  return combineReducers({
    [filePickerNamespace]: filePickerReducer,
    [mediaDetailsNamespace]: mediaDetailsReducer,
    [configNamespace]: configReducer,
    [userNamespace]: userReducer,
    [authNamespace]: authReducer,
    [appNamespace]: appReducer,
    ...asyncReducers
  });
}

export function injectAsyncReducer(store, name, asyncReducer) {
  store.asyncReducers[name] = asyncReducer;
  store.replaceReducer(createReducer(store.asyncReducers));
}
