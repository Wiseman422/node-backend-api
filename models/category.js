import uuid from 'node-uuid';
import Entity from './entity';

export default class Category extends Entity {
  constructor(database) {
    super(database, 'categories');
  }

  getAll() {
    return this.query(`select id, name, parentCategoryId from ${this.tableName} where deleted = @deleted`, { deleted: 0 });
  }

}
