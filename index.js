import { normalize } from 'normalizr';

/**
 * Check if action should be processed
 * @param  {Object} action  redux action
 * @param  {String|Regex} filter filter of action type to match
 * @return {Boolean}  shouldBeProcessed
 */
const shouldProcessAction = ({
  error,
  payload,
  meta,
  type,
}, filter) => (
  !!(!error && payload && meta && meta.schema && (!filter || (type && type.match(filter))))
);

/**
 * This callback fetch the data to normalize in the action
 *
 * @callback GetDataCb
 * @param {ReduxStore} store redux store
 * @param {ReduxAction} action redux action
 * @return {Object} data to normalize
 */
/**
 * This callback trigger after normalization and can mutate data
 *
 * @callback PostNormalizeCb
 * @param {ReduxAction} normalizedData redux action
 * @return {Object} mutated data
 */
/**
 * This callback trigger just before leaving for mutate the action or dispatch actions
 *
 * @callback OnNextCb
 * @param {ReduxStore} store redux store
 * @param {ReduxAction} action redux action
 * @param {ReduxAction} normalizedData redux action
 * @return {Object} normalized data
 */
/**
* Generate the midleware by default it handle every action with a data.meta.schema field
* normalize action.payload and replace the payload by normalized payload before p
* @param  {Object} action  redux action
* @param  {String} action.type  type used by actionFilter option
* @param  {Object} options middleware options
* @param  {String|Regex} [options.actionFilter] pattern of action type to handle
* @param  {GetDataCb} [options.getActionData] get data to normalize in action
* @param  {OnNextCb} [options.onNextAction] get data to normalize in action
* @param  {PostNormalizeCb} [options.onNormalizeData] update normalized data before sending action
* @return {ReduxMiddleware}         redux normalizr middleware
*/
export default (options) => {
  const opts = {
    actionFilter: null,
    getActionData: (store, action) => action.payload,
    onNormalizeData: normalizedData => normalizedData,
    onNextAction: (store, action, normalizedData) => ({
      ...action,
      payload: normalizedData,
    }),
    ...options,
  };


  return (store => next => (action) => {
    if (shouldProcessAction(action, opts.filter)) {
      const data = opts.getActionData(store, action);
      if (!data || typeof data !== 'object') return next(action);
      let normalizedData = normalize(data, action.meta.schema);

      normalizedData = opts.onNormalizeData(normalizedData);

      return next(opts.onNextAction(store, action, normalizedData));
    }

    return next(action);
  });
};
