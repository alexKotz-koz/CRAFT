const mongoose = require('mongoose');
const { Schema } = mongoose;

const VoteSchema = new Schema({
    voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vote: { type: Number, default: 0, min: -1, max: 1},
})

const ResponseSchema = new Schema({
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // Reference to comments
    votes: [VoteSchema]
});

const StudyResponseSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    task: { type: Schema.Types.ObjectId, ref: 'StudyTask', required: true },
    responses: [ResponseSchema],
    _participant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _dateCreated: { type: Date, default: Date.now }
});

mongoose.model('StudyResponse', StudyResponseSchema);

module.exports = { VoteSchema };