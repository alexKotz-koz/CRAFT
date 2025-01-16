const mongoose = require('mongoose');
const { Schema } = mongoose;

const DiscussionSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'StudyPrompt', required: true }],
    initialResponses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse', default: [] }]
});

mongoose.model('Discussion', DiscussionSchema);