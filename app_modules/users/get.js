// get method
module.exports = async ctx => {
  let { request, dispatch, userModel } = ctx;
  let response = {};
  try {
    if (request.params.userId) {
      response = await userModel.findById(request.params.userId);
    } else {
      response = await userModel.find();
    }
    dispatch.response(response);
  } catch (error) {
    dispatch.exception(request);
  }
};
