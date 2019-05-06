import { clamp, mean, isNaN, get } from 'lodash';
import { helpers } from 'veritone-redux-common';
const { createReducer } = helpers;

export const PICK_START = 'PICK_START';
export const PICK_END = 'PICK_END';
export const RETRY_REQUEST = 'RETRY_REQUEST';
export const RETRY_DONE = 'RETRY_DONE';
export const UPLOAD_REQUEST = 'UPLOAD_REQUEST';
export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS';
export const UPLOAD_COMPLETE = 'UPLOAD_COMPLETE';

export const namespace = 'filePicker';

const defaultPickerState = {
  open: false,
  state: 'selecting', // selecting | uploading | complete
  progressPercentByFileKey: {},
  success: false,
  error: false,
  warning: false,
  uploadResult: null
};

const defaultState = {
  // populated like:
  // [pickerId]: { ...defaultPickerState }
};

export default createReducer(defaultState, {
  [PICK_START](
    state,
    {
      meta: { id }
    }
  ) {
    return {
      [id]: {
        ...defaultPickerState,
        open: true,
        state: 'selecting'
      }
    };
  },
  [PICK_END](
    state,
    {
      meta: { id }
    }
  ) {
    return {
      ...state,
      [id]: {
        ...state[id],
        open: false
      }
    };
  },
  [RETRY_REQUEST](
    state,
    {
      meta: { id }
    }
  ) {
    return {
      ...state,
      [id]: {
        ...state[id],
        state: 'uploading',
        progressPercentByFileKey: {},
        success: null,
        error: null,
        warning: null
      }
    }
  },
  [RETRY_DONE](
    state,
    {
      meta: { id }
    }
  ) {
    return {
      ...state,
      [id]: {
        ...state[id],
        state: 'complete'
      }
    };
  },
  [UPLOAD_REQUEST](
    state,
    {
      meta: { id }
    }
  ) {
    // todo: status message
    return {
      ...state,
      [id]: {
        ...state[id],
        state: 'uploading',
        progressPercentByFileKey: {},
        success: null,
        error: null,
        warning: null,
        uploadResult: null
      }
    };
  },
  [UPLOAD_PROGRESS](
    state,
    {
      payload,
      meta: { fileKey, id }
    }
  ) {
    // todo: status message
    return {
      ...state,
      [id]: {
        ...state[id],
        progressPercentByFileKey: {
          ...state[id].progressPercentByFileKey,
          [fileKey]: payload
        }
      }
    };
  },
  [UPLOAD_COMPLETE](
    state,
    {
      payload,
      meta: { warning, error, id }
    }
  ) {
    const errorMessage = get(error, 'message', error); // Error or string
    // Extract failed files to be reuploaded
    const failedFiles = payload
      .filter(result => result.error)
      .map(result => result.file);
    // Combine existing uploadResult if any
    const prevUploadResult = (get(state, [id, 'uploadResult']) || [])
      .filter(result => !result.error);
    return {
      ...state,
      [id]: {
        ...state[id],
        success: !(warning || error) || null,
        error: error ? errorMessage : null,
        warning: warning || null,
        state: 'complete',
        uploadResult: prevUploadResult.concat(payload),
        failedFiles
      }
    };
  }
});

const local = state => state[namespace];

export const pick = id => ({
  type: PICK_START,
  meta: { id }
});

export const endPick = id => ({
  type: PICK_END,
  meta: { id }
});

export const retryRequest = (id, callback) => ({
  type: RETRY_REQUEST,
  payload: { callback },
  meta: { id }
});

export const retryDone = (id, callback) => ({
  type: RETRY_DONE,
  payload: { callback },
  meta: { id }
});

export const uploadRequest = (id, files, callback) => ({
  type: UPLOAD_REQUEST,
  payload: { files, callback },
  meta: { id }
});

export const uploadProgress = (id, fileKey, data) => ({
  type: UPLOAD_PROGRESS,
  payload: {
    ...data,
    percent: clamp(Math.round(data.percent), 100)
  },
  meta: { fileKey, id }
});

export const uploadComplete = (id, result, { warning, error }) => ({
  type: UPLOAD_COMPLETE,
  payload: result,
  meta: { warning, error, id }
});

export const isOpen = (state, id) => get(local(state), [id, 'open']);
export const state = (state, id) =>
  get(local(state), [id, 'state'], 'selecting');

// Keep this in case we want to go back to using mean percentage progresses
export const progressPercent = (state, id) => {
  const currentProgress = get(local(state), [id, 'progressPercentByFileKey']);
  if (!currentProgress) {
    return 0;
  }

  const meanProgress = mean(Object.values(currentProgress));
  const rounded = Math.round(meanProgress);
  return isNaN(rounded) ? 0 : rounded;
};
export const percentByFiles = (state, id) => {
  const currentFiles = get(local(state), [id, 'progressPercentByFileKey'], {});
  return Object.keys(currentFiles).map(key => {
    const value = currentFiles[key];
    return {
      key,
      value
    };
  })
}
export const failedFiles = (state, id) => {
  const failedFiles = get(local(state), [id, 'failedFiles'], []);
  return failedFiles;
};
export const uploadResult = (state, id) => get(local(state), [id, 'uploadResult']);
export const didSucceed = (state, id) => !!get(local(state), [id, 'success']);
export const didError = (state, id) => !!get(local(state), [id, 'error']);
export const didWarn = (state, id) => !!get(local(state), [id, 'warning']);
// todo: status message for normal cases
export const statusMessage = (state, id) =>
  get(local(state), [id, 'warning']) || get(local(state), [id, 'error']) || '';
