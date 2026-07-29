/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number) => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  deleteAtPath(obj[path[index]] as Record<string, unknown>, path, index + 1);
};

const toJSON = (schema: import('mongoose').Schema) => {
  const s = schema as any;
  let transform: ((doc: unknown, ret: Record<string, unknown>, options: unknown) => unknown) | undefined;
  if (s.options.toJSON && s.options.toJSON.transform) {
    transform = s.options.toJSON.transform;
  }

  s.options.toJSON = Object.assign(s.options.toJSON || {}, {
    transform(doc: unknown, ret: Record<string, unknown>, options: unknown) {
      Object.keys(schema.paths).forEach((pathKey) => {
        const pathObj = schema.paths[pathKey];
        if (pathObj.options && pathObj.options.private) {
          deleteAtPath(ret, pathKey.split('.'), 0);
        }
      });

      ret.id = (ret._id as { toString: () => string }).toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

export default toJSON;
