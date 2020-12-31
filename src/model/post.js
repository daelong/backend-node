import mongoose, { Schema } from 'mongoose';

//post 스키마 생성
const PostSchema = new Schema({
  title: String,
  body: String,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  //스키마 만들때 user정보가 들어갈 수 있게해줌
  user: {
    _id: mongoose.Types.ObjectId,
    username: String,
  },
});

//모델 생성
const Post = mongoose.model('Post', PostSchema);
export default Post;
