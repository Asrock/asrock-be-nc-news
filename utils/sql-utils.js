/**
 * Returns values ready to be added into the insert statement. i.e:
 * 
 * const { columns, params, values } = formatSqlInsert(...);
 *
 * db.query(\`INSERT INTO (${columns}) VALUES (${params})\`, values)
 * @param {Object} columns An object indicating which columns will be formatted. undefined values will remain in the results.
 * @param {Object} optionalColumns An object indicating optional values. undefined values will not be added.
 * @returns {{ columns: Array, params: Array, values: Array }}
 */
exports.formatSqlInsert = (columns = {}, optionalColumns = {}) => {
    const entity = { ...columns, ...optionalColumns };
    return Object
        .keys(entity)
        .filter(key => !(optionalColumns.hasOwnProperty(key) && optionalColumns[key] === undefined))
        .reduce(({ columns, params, values }, key, index) => ({
            columns: [...columns, key],
            params: [...params, `$${++index}`],
            values: [...values, entity[key]]
        }), { columns: [], params: [], values: [] });
}