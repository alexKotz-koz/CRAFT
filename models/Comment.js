const mongoose = require('mongoose');
const { Schema } = mongoose;

// Base Comment Schema
const BaseCommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    dateCreated: { type: Date, default: Date.now },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Track voters
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