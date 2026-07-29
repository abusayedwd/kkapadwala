/**
 * Create an object composed of the picked object properties
 */
const pick = <T extends Record<string, unknown>>(object: T, keys: (keyof T)[]) => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {} as Partial<T>);
};

export default pick;
