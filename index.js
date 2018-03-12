import { normalize } from 'normalizr';

export default (options) => {
  const opts = options || { actionFilter: /_FULFILLED$/ };
  return (store => next => (action) => {
    if (
      action.payload
    && action.payload.data
    && action.meta
    && action.meta.schema
    && (!opts.actionFilter
      || (action.type
        && action.type.match(opts.actionFilter)))) {
      const normalizedData = normalize(action.payload.data, action.meta.schema);
      store.dispatch({
        type: 'STORE_UPDATE',
        payload: normalizedData.entities,
      });
      return next({
        ...action,
        payload: {
          ...action.payload,
          data: normalizedData.result,
        },
      });
    }
    return next(action);
  });
};
