const mongoose = require('mongoose');
const { Schema } = mongoose;

const { CommentSchema } = require('./Discussion');

const ResponseSchema = new Schema({
    prompt: { type: String, required: true },
    response: { type: String, required: true }
});

const StudyResponseSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    responses: [ResponseSchema],
    participant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    dateCreated: { type: Date, default: Date.now }
});

mongoose.model('StudyResponse', StudyResponseSchema); 