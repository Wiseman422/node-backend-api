import uuid from 'node-uuid';
import Entity from './entity';
import Security from '../services/security';

export default class UserMembership extends Entity {
  constructor(database) {
    super(database, 'userMemberships');
  }

  getBusinessByUser(userId) {
    return this.query(`select u.id, u.userId, u.businessId, b.name 
    from ${this.tableName} u
    inner join businesses b on b.id = u.businessId
    where u.userId = @userId and u.deleted = 0`, {userId});
  }

  getByUserAndBusiness(userId, businessId) {
    return this.first(`select u.id, u.businessId from ${this.tableName} u
    where u.userId = @userId and u.businessId = @businessId and u.deleted = 0`, {userId, businessId});
  }

  getById(id) {
    return this.query(`
      select id, userId, businessId, type, interval, cost 
      from ${this.tableName} um
      where um.deleted = 0 and um.id = @id
    `, {id : id});
  }

  getByUser(userId) {
    return this.query(`
      select
        um.id, um.userId, um.businessId, b.categoryId, r.id as reviewId, um.referralLink, l.webAddress,
        um.visibility, b.name, c.name as category, r.rating, r.body as review, um.type, um.interval
      from ${this.tableName} um
      inner join businesses b on b.id = um.businessId
      inner join categories c on c.id = b.categoryId
      left join reviews r on r.userId = um.userId and r.businessId = b.id
      left join locations l on l.businessId = b.id and l.isPrimaryLocation = 1
      where um.deleted = 0 and um.userId = @userId
    `, {userId : userId});
  }

  insert(userMembership) {
    return this.getByUserAndBusiness(userMembership.userId, userMembership.businessId)
      .then(membership => {

        if (membership) {
          throw {status : 400, message : 'There is already a membership for this user and business'};
        }

        let now = new Date();

        userMembership.id = uuid.v4();
        userMembership.visibility = 0;
        userMembership.type = 0;
        userMembership.interval = 0;
        userMembership.deleted = false;
        userMembership.dateCreatedUtc = now;
        userMembership.dateModifiedUtc = now;

        return super.insert(userMembership)
          .then(() => userMembership);
      });
  }
}
