import { normalize } from 'normalizr';

export default (options) => {
  const opts = {
    actionFilter: null,
    getActionData: (store, action) => action.payload,
    onNormalizeData: (store, action, normalizedData) => normalizedData,
    onNextAction: (store, action, normalizedData) => ({
      ...action,
      payload: normalizedData,
    }),
    ...options,
  };
  return (store => next => (action) => {
    if (
      action.payload
      && action.meta
      && action.meta.schema
      && (!opts.actionFilter
        || (action.type
          && action.type.match(opts.actionFilter)))) {
      let normalizedData = normalize(opts.getActionData(store, action), action.meta.schema);
      normalizedData = opts.onNormalizeData(store, action, normalizedData);
      return next(opts.onNextAction(store, action, normalizedData));
    }
    return next(action);
  });
};
