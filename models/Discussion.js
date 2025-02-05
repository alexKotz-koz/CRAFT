const mongoose = require('mongoose');
const { Schema } = mongoose;

const PromptSchema = new Schema ({
    id: { type: String},
    question: {type: String}
});

const DiscussionSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    task: { type: Schema.Types.ObjectId, ref: 'StudyTask', required: true},
    prompts: [PromptSchema],
    initialResponses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse', default: [] }]
});

mongoose.model('Discussion', DiscussionSchema);