const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // ObjectId: 컬렉션에서 추가된 고유 객체ID, User를 참조해서 가져오겠다는 의미
    pinned: Boolean, // user가 게시를 할것인지 아닌지 여부 체크
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // 어떤 유저들이 좋아요를 눌렀는지 파악
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: Schema.Types.ObjectId, ref: 'Post' } // 우리가 리트윗했을 때 생성된 데이터필드 값 별도의 게시물이 된다.
},
{ timestamps: true });

module.exports = mongoose.model('Post', PostSchema)