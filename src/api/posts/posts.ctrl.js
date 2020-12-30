import Post from '../../model/post';
import mongoose from 'mongoose';
import Joi from '@hapi/joi';

const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

// 포스트 작성 POST /api/posts {title, body}
//함수 바로 빼내주기
export const write = async (ctx) => {
  //Joi로 제약사항 넣어주기
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  //REST API의 Requset Body는 ctx.request.body에서 조회할 수 있다.
  //post로 사용할 것이므로 requset.body에 담겨진다.
  const { title, body } = ctx.request.body;
  const post = new Post({
    title,
    body,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

//포스트 목록 조회 get /api/posts
export const list = async (ctx) => {
  const page = parseInt(ctx.query.page || '1', 10);

  if (page < 1) {
    ctx.status = 400;
    return;
  }
  //전체를 보기 위한 것이니 그냥 posts배열 자체를 가져온다.
  try {
    const posts = await Post.find()
      .sort({ _id: -1 }) //최신순
      .limit(10) //10개로 리스트 제한
      .skip((page - 1) * 10) //페이지
      .lean()
      .exec();
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10)); //마지막 페이지
    ctx.body = posts.map((post) => ({
      ...post,
      body:
        post.body.length < 200 ? post.body : `${post.body.slice(0, 150)}...`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

//특정 포스트 조회 get /api/posts/:id
export const read = async (ctx) => {
  const { id } = ctx.params;
  // 주어진 id 값으로 포스트를 찾는다.
  try {
    //id값으로 검색
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 특정 포스트 제거 delete /api/posts/:id
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndDelete(id).exec();
    ctx.status = 204; //성공은 했지만 응답할 데이터가 없음
  } catch (e) {
    ctx.throw(500, e);
  }
};

//포스트 수정(특정 필드 변경) patch /api/posts/:id { title, body }
export const update = async (ctx) => {
  //patch는 주어진 필드만 교체함
  const { id } = ctx.params;

  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
  });

  //검증하고나서 검증 실패인 경우 에러처리
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = reuslt.error;
    return;
  }

  //해당 id를 가진 post가 몇번째인지 확인한다.
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
