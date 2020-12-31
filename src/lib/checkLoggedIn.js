const checkLoggedIn = (ctx, next) => {
  //state.user가 없으면 로그인이 안되어있는것
  if (!ctx.state.user) {
    ctx.status = 401; //Unauthorized
    return;
  }
  return next();
};
export default checkLoggedIn;
