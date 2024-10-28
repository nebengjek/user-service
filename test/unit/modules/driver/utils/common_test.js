const { expect } = require('chai');
const { filterEmailOrMobileNumber } = require('../../../../../src/modules/driver/utils/common');

describe('filterEmailOrMobileNumber', () => {
  it('should return an object with email when username includes @', () => {
    const username = 'test@example.com';
    const result = filterEmailOrMobileNumber(username);
    expect(result).to.deep.equal({ email: 'test@example.com' });
  });

  it('should return an object with mobileNumber when username does not include @', () => {
    const username = '1234567890';
    const result = filterEmailOrMobileNumber(username);
    expect(result).to.deep.equal({ mobileNumber: '1234567890' });
  });
});
