const mongoose = require('mongoose');
const { Schema } = mongoose;

const DiscussionSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    task: { type: Schema.Types.ObjectId, ref: 'StudyTask', required: true},
    prompts: [{ type: String, required: true }],
    initialResponses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse', default: [] }]
});

mongoose.model('Discussion', DiscussionSchema);