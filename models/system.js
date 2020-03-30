import Entity from './entity';

export default class System extends Entity {
  constructor(database) {
    super(database, 'zipcodes');
  }

  getZip(zip) {
    return this.query(`select zip, city, state, latitude, longitude 
    from ${this.tableName} where zip = @zip`, { zip })
    .then(function (rows) {
      return rows;
    });
  }

  searchZip(zip) {
    zip += '%';

    return this.query(`select zip, city, state 
    from ${this.tableName} where zip LIKE @zip 
    ORDER BY zip`, { zip });
  }
}
