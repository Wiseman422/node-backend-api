import uuid from 'node-uuid';
import Entity from './entity';

export default class LegalPolicy extends Entity {
  constructor(database) {
    super(database, 'LegalPolicies');
  }

  lastByPolicyType(legalPolicyType) {
    return this.first(`select TOP 1 id, legalCopy, legalPolicyType, effectiveDate from ${this.tableName}
    where legalPolicyType = @legalPolicyType
    order by effectiveDate desc`, { legalPolicyType });
  }

}
