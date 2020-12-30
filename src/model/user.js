import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String, // 단방향 해시 함수 적용한 암호화된 password
});

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10); //password hash
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword); //password check
  return result;
};

UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username }); //username으로 같은 username이 있는지 찾음
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

const User = mongoose.model('User', UserSchema);
export default User;
