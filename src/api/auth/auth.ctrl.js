import Joi from '@hapi/joi';
import User from '../../model/user';

/* post /api/auth/register
{
    username: string,
    password: string,
}
*/
export const register = async (ctx) => {
  //Reqeust Body 검증
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    //username이 이미 있는지 확인
    const exists = await User.findByUsername(username);
    //아이디 중복 확인
    if (exists) {
      ctx.status = 409;
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password); //비밀번호 설정
    await user.save(); //데이터베이스에 저장

    //저장 했으니 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, //7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

//post /api/auth/login
export const login = async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 401; //Unauthorized
    return;
  }
  try {
    const user = await User.findByUsername(username);
    //계정 있는지 없는지 확인
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    //비밀번호 확인
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();
    console.log(process.env.JWT_SECRET);
    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, //7일
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

// get /api/auth/check
export const check = async (ctx) => {
  console.log(Date.now());
  //로그인 상태 확인
  const user = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};

// post /api/auth/logout
export const logout = async (ctx) => {
  //쿠키를 지움으로써 로그아웃
  ctx.cookies.set('access_token');
  ctx.status = 204;
};
