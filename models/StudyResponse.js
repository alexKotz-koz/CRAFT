const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudyResponseSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    prompt: { type: Schema.Types.ObjectId, ref: 'StudyPrompt', required: true},
    response: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    _participant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _dateCreated: { type: Date, default: Date.now }
});

mongoose.model('StudyResponse', StudyResponseSchema);