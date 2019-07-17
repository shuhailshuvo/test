// post method
module.exports = async ctx => {
  let { request, dispatch, userModel } = ctx;
  try {
    let response = await userModel.create(request.body);
    if (!response) {
      dispatch.exception({ status: 400, message: "Invalid input" });
    }
    dispatch.response(response);
  } catch (error) {
    dispatch.exception(error);
  }
};
