const mongoose = require('mongoose');
const { Schema } = mongoose;
const { VoteSchema } = require('./StudyResponse');

// Base Comment Schema
const BaseCommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    votes: [VoteSchema],
    dateCreated: { type: Date, default: Date.now },
    studyId: { type: Schema.Types.ObjectId, ref: 'Study', required: true } 
}, { discriminatorKey: 'kind', timestamps: true });

// Create the base model
const Comment = mongoose.model('Comment', BaseCommentSchema);

// Initial Response Comment Schema
const InitialResponseCommentSchema = new Schema({
    response: { type: Schema.Types.ObjectId, ref: 'Response', required: true }
});

// Subcomment Schema
const SubCommentSchema = new Schema({
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true }
});

// Create discriminators
const InitialResponseComment = Comment.discriminator('InitialResponseComment', InitialResponseCommentSchema);
const SubComment = Comment.discriminator('SubComment', SubCommentSchema);

module.exports = { Comment, InitialResponseComment, SubComment };