const mongoose = require('mongoose');
// 스키마는 컬렉션을 선언할 수 있는 모델과 같다. 컬렉션은 테이블 구조라고 생각할 수 있다. 컬렉션은 도큐먼트를 저장하는 저장소이다.
// 각 필드 또는 열을 선언한다.
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    // 필드명: type(형태), required(필요), trim, unique(고유한 값), default
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, },
    profilePic: { type: String, default:"/images/profilePic.jpeg" },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // 좋아요를 누른 게시글을 추적하기 위해서
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }], // 마찬가지로 리트윗한 게시글을 추적하기 위해서
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // following 유저 id 저장
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }]  // follwer들의 유저 id 저장
    // timestaps를 추가
}, { timestamps: true });
// model: model을 내보내거나 선언하는 함수
const User = mongoose.model('User', UserSchema);
module.exports = User;
