const { jsonToGraphQLQuery } = require('json-to-graphql-query');
const _mergeWith = require('lodash.mergewith');
const _cloneDeepWith = require('lodash.clonedeepwith');

function generateGraphQLFixture(type = 'mutation', funcName, args = {}, returning = {}) {
  const query = {
    [type]: {
      [funcName]: {
        __args: args,
        ...returning
      }
    }
  }

  return function (data = {}) {
    // Iterate through data and update args
    // Four cases for updating a field
    // 1. Use default value => Do not define that field in data
    // 2. Update to new value => Define that field with the new value in data
    // 3. Set field to empty => Use __SET_EMPTY against that field
    // 4. Remove field => Use __REMOVE against that field

    function modifyFields(defaultValue, newValue) {
      switch (newValue) {
        case '__SET_EMPTY':
          return '';
        case '__REMOVE':
          return '__REMOVE';
        default:
          break;
      }
    }

    function removeFields(collection) {

      function removeField(element) {

        if (element && typeof element === 'object') {
          for (const key in element) {
            if (element.hasOwnProperty(key)) {
              const value = element[key];
              if (value === '__REMOVE') {
                delete element[key];
              }
            }
          }
        }
      }

      return _cloneDeepWith(collection, removeField);
    }

    let updatedArgs = _mergeWith(args, data, modifyFields);
    updatedArgs = removeFields(updatedArgs)

    query[type][funcName]['__args'] = updatedArgs;

    return jsonToGraphQLQuery(query, { pretty: true });
  }
}

module.exports = {
  generateGraphQLFixture
};