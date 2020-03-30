import uuid from 'node-uuid';
import Entity from './entity';

export default class BusinessMetadata extends Entity {
  constructor(database) {
    super(database, 'businessMetadatas');
  }

  getByBusiness(businessId) {
    return this.query(`select id, businessId, pageType, url, [order], step, selector, membershipField from ${this.tableName} where businessId = @businessId`, { businessId });
  }

  updateByBusinessIdUrl(pBusinessId, pUrl, data) {
    pUrl = '%' + pUrl + '%';

    let where = `LOWER(url) LIKE LOWER(@pUrl) and businessId = @pBusinessId`
    return this.updateWhere(where, { pBusinessId, pUrl }, data);
  }


  deleteByBusinessAndId(businessId, id) {
    return this.first(`delete from ${this.tableName} where Id = @id and businessId = @businessId`, { id, businessId });
  }

  insert(businessMetadata) {
    businessMetadata.id = uuid.v4();

    return super.insert(businessMetadata)
    .then(() => businessMetadata);
  }
}
