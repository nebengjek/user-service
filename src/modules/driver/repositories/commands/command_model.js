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

const driver = joi.object({
  email: joi.string().email().required().messages({
    'string.pattern.base': 'Lengkapi email.',
  }),
  mobileNumber: joi.string().regex(/^[+]62/).required().messages({
    'string.pattern.base': 'Lengkapi Nomor handphone anda',
  }),
  city: joi.string().required().messages({
    'any.required': 'Kota diperlukan.'
  }),
  province: joi.string().required().messages({
    'any.required': 'Provinsi diperlukan.'
  }),
  jenisKendaraan: joi.string().required().messages({
    'any.required': 'Jenis kendaraan diperlukan.'
  }),
  nopol: joi.string().pattern(/^[A-Za-z]{1,2}\s?\d{1,4}\s?[A-Za-z]{1,3}$/).required().messages({
    'string.pattern.base': 'Nomor polisi tidak sesuai format yang berlaku.',
    'any.required': 'Nomor polisi diperlukan.'
  }),
  kontakKeluargaLainnya: joi.string().regex(/^[+]62\d{9,15}$/).required().messages({
    'string.pattern.base': 'Kontak keluarga harus dimulai dengan kode negara (+62) diikuti nomor telepon.',
    'any.required': 'Kontak keluarga lainnya diperlukan.'
  })
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
  driver
};
