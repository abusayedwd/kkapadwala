import { Schema, FilterQuery } from 'mongoose';

const paginate = (schema: Schema) => {
  schema.statics.paginate = async function (filter: FilterQuery<unknown>, options: Record<string, string | number>) {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      String(options.sortBy)
        .split(',')
        .forEach((sortOption) => {
          const [key, order] = sortOption.split(':');
          sortingCriteria.push((order === 'desc' ? '-' : '') + key);
        });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && parseInt(String(options.limit), 10) > 0 ? parseInt(String(options.limit), 10) : 10;
    const page = options.page && parseInt(String(options.page), 10) > 0 ? parseInt(String(options.page), 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      String(options.populate)
        .split(',')
        .forEach((populateOption) => {
          const [field, ...fieldsToPopulate] = populateOption.split(' ');
          let populateFields = '';
          if (fieldsToPopulate.length > 0) {
            populateFields = fieldsToPopulate.join(' ');
          }
          docsPromise = docsPromise.populate({
            path: field,
            select: populateFields,
          });
        });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;
