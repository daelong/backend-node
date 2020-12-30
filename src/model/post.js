import mongoose, { Schema } from 'mongoose';

//post 스키마 생성
const PostSchema = new Schema({
  title: String,
  body: String,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});

//모델 생성
const Post = mongoose.model('Post', PostSchema);
export default Post;
