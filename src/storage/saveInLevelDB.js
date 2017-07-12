import LevelPromise from 'level-promise';
import _ from 'lodash';
import levelup from 'levelup';
import uuid from 'uuid';

/* eslint-disable no-use-before-define */

const getType = (value) => {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
};

const saveSimpleValue = (context, key, value) => {
  const type = getType(value);
  const valueToSave = ['object', 'array'].includes(type) ? JSON.stringify(value) : value;

  return context.db.put(key, `${type}:${valueToSave}`)
    .then(() => context.logger.info(`saved ${key}`));
};

const createId = (context, element) => {
  const savedKey = context.map.get(element);
  if (savedKey) {
    return savedKey;
  }
  const newKey = uuid.v4();
  context.map.set(element, newKey);

  return newKey;
};

const saveArray = (context, key, value) => {
  const ids = value.map(element => createId(context, element));

  return Promise.all([
    saveSimpleValue(context, key, ids),
    ...ids.map((id, i) => saveAny(context, id, value[i])),
  ]);
};

const saveObject = (context, key, value) => {
  const ids = _.mapValues(value, element => createId(context, element));

  return Promise.all([
    saveSimpleValue(context, key, ids),
    ..._.map(ids, (id, innerKey) => saveAny(context, id, value[innerKey])),
  ]);
};

const saveAny = (context, key, value) => {
  const type = getType(value);
  if (type === 'array') {
    return saveArray(context, key, value);
  }
  if (type === 'object') {
    return saveObject(context, key, value);
  }

  return saveSimpleValue(context, key, value);
};

const saveInLevelDB = (databaseDirectory, logger) => (key, value) => {
  const db = LevelPromise(levelup(databaseDirectory));
  const rootKey = 'root';
  const context = {
    db,
    logger,
    map: new Map(),
  };

  return db.get(rootKey)
    .catch((error) => {
      if (error instanceof levelup.errors.NotFoundError) {
        return 'array:[]';
      }

      throw error;
    })
    .then(root => JSON.parse(root.replace(/^array:/, '')))
    .then(root => saveSimpleValue(context, rootKey, [...root, key]))
    .then(() => saveAny(context, key, value))
    .then(() => db.close())
    .catch(error => logger.error(error));
};

export default saveInLevelDB;
