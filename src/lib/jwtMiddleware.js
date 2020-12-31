//토큰 검증을 위한 미들웨어
import jwt from 'jsonwebtoken';
import User from '../model/user';

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next(); //토큰이 없음
  try {
    //토큰 복호화
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //미들웨어에서 사용하기 위해 state에 넣어줌
    ctx.state.user = {
      _id: decoded._id,
      username: decoded.username,
    };

    //토큰의 유효기간이 얼마나 남았는지 확인하고 재발급
    const now = Math.floor(Date.now() / 1000); //Date.now의 값은 밀리세컨드 값이 들어가있으므로 1000으로 나눠준다.
    if (decoded.exp - now < 60 * 60 * 24 * 3) {
      const user = await User.findById(decoded._id);
      const token = user.generateToken();
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
      });
    }
    return next();
  } catch (e) {
    return next();
  }
};

export default jwtMiddleware;
