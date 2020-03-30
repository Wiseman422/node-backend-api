import uuid from 'node-uuid';
import Entity from './entity';
import BusinessLocationType from '../enums/businessLocationType';
export default class Business extends Entity {
  constructor(database) {
    super(database, 'businesses');
  }

  findFirst10() {
    return this.query(`select top 10 name from ${this.tableName}`)
      .then(function (rows) {
        return rows;
      });
  }

  getBusinessUrls(name) {

    let sql = `select distinct businesses.id, businesses.categoryId, businesses.name, businesses.description, locations.webaddress as url from ${this.tableName} left join locations on businesses.id = locations.businessid where businesses.deleted = 0`;

    if (name) {
      sql += ` and LOWER(businesses.name) LIKE LOWER(@name)`;
      name += '%';
    }
    else {
      sql += ` and locations.webaddress is not null`;
    }

    return this.query(sql, {name})
      .then(function (rows) {
        return rows;
      });
  }

  getBusinessUrlsByLocationId(id) {

    let sql = `select distinct businesses.id, locations.id as urlId, businesses.name, businesses.description, 
    locations.webaddress as url 
    from ${this.tableName} 
    left join locations on businesses.id = locations.businessid 
    where 
    locations.id = @id and
    businesses.deleted = 0 and 
    locations.webaddress is not null`;

    return this.first(sql, {id})
      .then(function (row) {
        return row;
      });
  }


  getBusinessDeals(businessId) {
    console.log(businessId);
    return this.query(`
      select
        id, name, businessId, dealType, newMemberGets ,additionalInfo, description,
        redemptionInstructions, couponCode, startDate, endDate, affiliateUrl, restrictions
      from deals
      where businessId = @businessId
    `, {businessId : businessId});
  }

  getBusinessDeal(businessid, dealid) {
    return this
      .query('select Id, Name, BusinessId, DealType, NewMemberGets, AdditionalInfo, Description, RedemptionInstructions, CouponCode, StartDate, EndDate, AffiliateUrl, Restrictions from deals where businessid = @businessid and id = @dealid ', {
        businessid : businessid,
        dealid     : dealid
      })
      .then(function (rows) {
        return rows;
      });
  }

  insert(business) {
    let now = new Date();

    business.id = uuid.v4();
    business.locationType =
      business.isActive = true;
    business.shouldGetDeals = true;
    business.isPublic = false;
    business.isClaimed = false;
    business.dateCreatedUtc = now;
    business.dateModifiedUtc = now;
    business.locationType = BusinessLocationType.value('Local');
    business.AggregateRating = 0;
    business.hasDeal = false;
    business.deleted = false;

    return super.insert(business)
      .then(() => business);

  }
}
