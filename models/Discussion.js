const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    dateCreated: { type: Date, default: Date.now },
    subcomments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

const DiscussionSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'StudyPrompt', required: true }],
    initialResponses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse' }],
    comments: [CommentSchema]
});

mongoose.model('Discussion', DiscussionSchema);
mongoose.model('Comment', CommentSchema);