import uuid from 'node-uuid';
import Entity from './entity';
import DomainParse from '../services/domainParse';

export default class Location extends Entity {
  constructor(database) {
    super(database, 'locations');
  }

  getByBusiness(businessId) {
    return this.query(`select id, businessId, webAddress as url from ${this.tableName} where businessId = @businessId`, { businessId });
  }

  getByDomain(domain) {
    return this.query(`select id, businessId, webAddress as url 
    from ${this.tableName} 
    where webAddress is not null and LOWER(webAddress) LIKE LOWER(@domain)`, { domain : '%' + domain + '%' })
    .then(rows => {
      return rows.filter((row) => {
        let domainParse = new DomainParse();
        return domainParse.parse(row.url).indexOf(domain) === 0;
      });
    });
  }

  updateByBusinessIdUrl(pBusinessId, pUrl, data) {
    pUrl = '%' + pUrl + '%';

    let where = `LOWER(webAddress) LIKE LOWER(@pUrl) and businessId = @pBusinessId`
    return this.updateWhere(where, { pBusinessId, pUrl }, data);
  }

  insert(businessLocation) {
    let now = new Date();

    businessLocation.id = uuid.v4();
    businessLocation.isPrimaryLocation = false;
    businessLocation.deleted = false;
    businessLocation.dateCreatedUtc = now;
    businessLocation.dateModifiedUtc = now;

    return super.insert(businessLocation)
    .then(() => businessLocation);
  }
}
