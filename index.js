import { normalize } from 'normalizr';

//
// onNormalizeData: (store, action, normalizedData) => {
//   store.dispatch({
//     type: 'STORE_UPDATE',
//     payload: normalizedData.entities,
//   });
//   return (normalizedData);
//   },
// onNextAction: (store, action, normalizedData) => ({
//   ...action,
//   payload: {
//     ...action.payload,
//     data: normalizedData.result,
//   },
// }),
// actionFilter:/_FULFILLED$/
export default (options) => {
  const opts = {
    actionFilter: null,
    onNormalizeData: (store, action, normalizedData) => normalizedData,
    onNextAction: (store, action, normalizedData) => ({
      ...action,
      payload: {
        ...action.payload,
        data: normalizedData,
      },
    }),
    ...options,
  };
  return (store => next => (action) => {
    if (
      action.payload
      && action.payload.data
      && action.meta
      && action.meta.schema
      && (!opts.actionFilter
        || (action.type
          && action.type.match(opts.actionFilter)))) {
      let normalizedData = normalize(action.payload.data, action.meta.schema);
      normalizedData = opts.onNormalizeData(store, action, normalizedData);
      return next(opts.onNextAction(store, action, normalizedData));
    }
    return next(action);
  });
};
