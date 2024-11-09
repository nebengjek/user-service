
const commonHelper = require('all-in-one');
const _ = require('lodash');
const wrapper = commonHelper.Wrapper;
const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const queryHandler = require('../repositories/queries/query_handler');

const { ERROR:httpError, SUCCESS:http } = commonHelper;

const loginDriver = async (req, res) => {
  const payload = req.body;
  const validatePayload = commonHelper.isValidPayload(payload, commandModel.login);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.loginDriver(result.data);
  };

  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Login User')
      : wrapper.response(res, 'success', result, 'Login User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getDriver = async (req, res) => {
  const { userId } = req.userMeta;
  const getData = async () => queryHandler.getDriver(userId);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get User', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get User', http.OK);
  };
  sendResponse(await getData());
};

const registerDriver = async (req, res) => {
  const payload = req.body;
  const validatePayload = commonHelper.isValidPayload(payload, commandModel.register);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.registerDriver(result.data);
  };
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Register User', httpError.CONFLICT)
      : wrapper.response(res, 'success', result, 'Register User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const updateDataDriver = async (req, res) => {
  const { email,mobileNumber,userId } = req.userMeta;
  req.body.mobileNumber = _.isEmpty(mobileNumber) ? req.body.mobileNumber : mobileNumber
  req.body.email = _.isEmpty(email) ? req.body.email : email
  const payload = req.body;
  const validatePayload = commonHelper.isValidPayload(payload, commandModel.driver);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.updateDataDriver(userId,result.data);
  };
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Update User', httpError.CONFLICT)
      : wrapper.response(res, 'success', result, 'Update User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

module.exports = {
  loginDriver,
  registerDriver,
  getDriver,
  updateDataDriver
};
