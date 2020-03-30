import _ from 'lodash';

export default class Entity {
  constructor(database, tableName) {
    this.database = database;
    this.tableName = tableName;
  }

  findById(id) {
    return this.first(`select * from ${this.tableName} where Id = @id`, { id });
  }

  hardDeleteById(id) {
    return this.first(`delete from ${this.tableName} where Id = @id`, { id });
  }

  softDeleteById(id) {
    return this.first(`update ${this.tableName} set deleted = @deleted where Id = @id`, { id, deleted: true });
  }

  insert(obj) {
    let properties = Object.keys(obj);
    let columnNames = properties.map(property => '[' + property + ']');
    let paramNames = properties.map(property => '@' + property);

    let sql = `insert into ${this.tableName} (${columnNames.join()}) values (${paramNames.join()})`;

    return this.insertRaw(sql, obj);
  }

  update(id, obj) {
    if (obj.id) {
      delete obj.id;
    }

    let properties = Object.keys(obj);
    let updates = properties.map(prop => `[${prop}] = @${prop}`);

    let sql = `update ${this.tableName} set ${updates.join()} where id = @id`;

    obj.id = id;

    return this.first(sql, obj);
  }

  updateWhere(whereSql, filter, obj) {

    let properties = Object.keys(obj);
    let updates = properties.map(prop => `[${prop}] = @${prop}`);

    let sql = `update ${this.tableName} set ${updates.join()} where `;
    sql += whereSql;

    obj = _.assign(obj, filter);

    return this.first(sql, obj);
  }


  insertRaw(sql, params) {
    return this.first(sql, params);
  }

  first(sql, params) {
    return this.query(sql, params)
    .then(rows => rows && rows.length ? rows.shift() : null);
  }

  query(sql, params) {
    return this.database.query(sql, params);
  }
}
