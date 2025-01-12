const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudyPromptSchema = new Schema({
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    prompt: { type: String, required: true },
});

mongoose.model('StudyPrompt', StudyPromptSchema);