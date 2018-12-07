import { normalize } from 'normalizr';

const debug = require('debug')('redux-normalizr');
const debugData = require('debug')('redux-normalizr-data');

/**
 * Check if action should be processed
 * @param  {Object} action  redux action
 * @param  {String|Regex} filter filter of action type to match
 * @return {Boolean}  shouldBeProcessed
 */
const shouldProcessAction = (action, filter) => {
  const {
    error,
    payload,
    meta,
    type,
  } = action;

  return (!!(
    !error && payload && meta && meta.schema
       && (!filter
          || (
            typeof filter === 'function'
              ? filter(action)
              : (type && type.match(filter)
              )
          )
       )
  ));
};
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
 * @param {Object} normalizedData redux action
 * @param {Object} original data
 * @return {Object} normalized data
 */
/**
* Generate the midleware by default it handle every action with a data.meta.schema field
* normalize action.payload and replace the payload by normalized payload before p
* @param  {Object} action  redux action
* @param  {String} action.type  type used by actionFilter option
* @param  {Object} options middleware options
* @param  {String|Regex|Function} [options.actionFilter] pattern of action type to handle
* *                               or function taking action and return if should be treated
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
    debug('Action received', action.type);
    debugData(action);
    if (shouldProcessAction(action, opts.filter)) {
      debug('Processing action');
      debug('  getActionData');
      const data = opts.getActionData(store, action);
      debugData(data);

      if (!data || typeof data !== 'object') {
        debug('  Data returned is not an object or null');
        return next(action);
      }
      debug('  Normalize data');
      let normalizedData = normalize(data, action.meta.schema);
      debugData(normalizedData);

      debug('  onNormalizeData');
      normalizedData = opts.onNormalizeData(normalizedData);
      debugData(normalizedData);
      debug('  onNextAction');
      const mutatedAction = opts.onNextAction(store, action, normalizedData, data);
      debugData(normalizedData);

      return next(mutatedAction);
    }
    debug('Action not processed');

    return next(action);
  });
};
