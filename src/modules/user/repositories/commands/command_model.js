const joi = require('joi');

const login = joi.object({
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  password: joi.string().required()
});

const logout = joi.object({
  accessToken: joi.string().required()
});

const register = joi.object({
  fullName: joi.string().required(),
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  password: joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
    'string.pattern.base': 'Password harus memiliki setidaknya 8 karakter, dengan minimal satu huruf besar, satu huruf kecil, satu angka, dan satu karakter khusus.',
    'any.required': 'Password diperlukan.'
  }),
  referralCode: joi.string().optional().allow('')
});

const verifyOtp = joi.object({
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  otp: joi.string().required()
});

module.exports = {
  login,
  logout,
  register,
  verifyOtp,
};
