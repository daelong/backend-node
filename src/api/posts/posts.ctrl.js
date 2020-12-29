//psots의 컨트롤러 파일

let postId = 1; //id의 초기값

//posts 배열 초기 데이터
const posts = [
  {
    id: 1,
    title: '제목',
    body: '내용',
  },
];

// 포스트 작성 POST /api/posts {title, body}
//함수 바로 빼내주기
exports.write = (ctx) => {
  //REST API의 Requset Body는 ctx.request.body에서 조회할 수 있다.
  //post로 사용할 것이므로 requset.body에 담겨진다.
  const { title, body } = ctx.request.body;
  postId += 1;
  const post = { id: postId, title, body };
  posts.push(post); //배열 데이터에 추가
  ctx.body = post;
};

//포스트 목록 조회 get /api/posts
exports.list = (ctx) => {
  //전체를 보기 위한 것이니 그냥 posts배열 자체를 가져온다.
  ctx.body = posts;
};

//특정 포스트 조회 get /api/posts/:id
exports.read = (ctx) => {
  const { id } = ctx.params;
  // 주어진 id 값으로 포스트를 찾는다.
  //파라미터로 받은 값은 문자열 형식이므로 p.id 값이랑 형식을 같게해서 검색한다.
  const post = posts.find((p) => p.id.toString() === id);
  //포스트가 없으면 오류를 반환
  if (!post) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  ctx.body = post;
};

// 특정 포스트 제거 delete /api/posts/:id
exports.remove = (ctx) => {
  const { id } = ctx.params;
  //해당 id를 가진 post가 몇번째인지 확인
  const index = posts.findIndex((p) => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않는다.',
    };
    return;
  }
  // index번째 아이템을 제거
  posts.splice(index, 1);
  ctx.status = 204;
};

// 포스트 교체 put /api/posts/:id { title, body }
exports.replace = (ctx) => {
  // put은 전체 포스트 데이터 통째로 교체할 때 사용
  const { id } = ctx.params;
  // id 몇번째인지 확인
  const index = posts.findIndex((p) => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  //전체 객체를 덮어 씌움 ->  id빼고 다른 기존 정보 날리고 새로 만든다.
  posts[index] = {
    id,
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};

//포스트 수정(특정 필드 변경) patch /api/posts/:id { title, body }
exports.update = (ctx) => {
  //patch는 주어진 필드만 교체함
  const { id } = ctx.params;
  //해당 id를 가진 post가 몇번째인지 확인한다.
  const index = posts.findIndex((p) => p.id.toString() === id);
  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  posts[index] = {
    ...posts[index],
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};
