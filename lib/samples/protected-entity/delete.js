// delete method
module.exports = async ctx => {
  // ctx contains request, response, dispatch, schema, method & much more...
  // check documentation
  try {
    let { request, dispatch } = ctx;
    /* do your job
    /   if something went wrong, throw custom error or it will be 500 by default
    /   throw {
    /     status: 400, 
    /     message:"Invalid input", 
    /     data:{
    /      location: "/",
    /      additionalInfo:"Some useful trace"
    /    }
    /  }
    /*/
    dispatch.response(request);
  } catch (error) {
    dispatch.error(request);
  }
};
