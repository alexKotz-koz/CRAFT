const mongoose = require('mongoose');
const { Schema } = mongoose;

const ResponseSchema = new Schema({
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // Reference to comments
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Track voters
});

const StudyResponseSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    responses: [ResponseSchema],
    participant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateCreated: { type: Date, default: Date.now }
});

mongoose.model('StudyResponse', StudyResponseSchema);