
const commonHelper = require('all-in-one');

const wrapper = commonHelper.Wrapper;
const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const queryHandler = require('../repositories/queries/query_handler');

const { ERROR:httpError, SUCCESS:http } = commonHelper;

const loginUser = async (req, res) => {
  const payload = req.body;
  const validatePayload = commonHelper.isValidPayload(payload, commandModel.login);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.loginUser(result.data);
  };

  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Login User')
      : wrapper.response(res, 'success', result, 'Login User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getUser = async (req, res) => {
  const { userId } = req.userMeta;
  const getData = async () => queryHandler.getUser(userId);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get User', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get User', http.OK);
  };
  sendResponse(await getData());
};

const registerUser = async (req, res) => {
  const payload = req.body;
  const validatePayload = commonHelper.isValidPayload(payload, commandModel.register);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.registerUser(result.data);
  };
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Register User', httpError.CONFLICT)
      : wrapper.response(res, 'success', result, 'Register User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

module.exports = {
  loginUser,
  registerUser,
  getUser
};
