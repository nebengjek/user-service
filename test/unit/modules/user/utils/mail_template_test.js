const { expect } = require('chai');
const { emailVerification, mobileNumberVerification } = require('../../../../../src/modules/user/utils/mail_template');

describe('mail_template', () => {
  it('should return OTP message for email verification', () => {
    const otp = '123456';
    const result = emailVerification(otp);
    expect(result).to.equal('123456 is your one time password (OTP) for email verification');
  });

  it('should return OTP message for mobile number verification', () => {
    const otp = '123456';
    const result = mobileNumberVerification(otp);
    expect(result).to.equal('123456 is your OTP for mobile number verification');
  });
});
