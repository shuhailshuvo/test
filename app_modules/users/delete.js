// delete method
module.exports = async ctx => {
  let { request, dispatch, userModel } = ctx;
  let response = {};
  try {
    response = await userModel.findByIdAndDelete(request.params.userId);
    if (!response) {
      dispatch.exception({ status: 400, message: "Invalid Id" });
    }
    dispatch.response(response);
  } catch (error) {
    dispatch.exception(error);
  }
};
