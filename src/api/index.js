const Router = require('koa-router');
const posts = require('./posts');

const api = new Router();

//라우터 설정
api.use('/posts', posts.routes());

//라우터를 내보낸다
module.exports = api;
