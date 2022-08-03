const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // ObjectId: 컬렉션에서 추가된 고유 객체ID, User를 참조해서 가져오겠다는 의미
    pinned: Boolean // user가 게시를 할것인지 아닌지 여부 체크
},
{ timestamps: true });

module.exports = mongoose.model('Post', PostSchema)