const emailVerification = (otp) => `${otp} is your one time password (OTP) for email verification`;

const mobileNumberVerification = (otp) => `${otp} is your OTP for mobile number verification`;

module.exports = {
  emailVerification,
  mobileNumberVerification,
};
