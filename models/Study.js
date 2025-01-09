const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyParticipantSchema = require('./StudyParticipant');
const StudyPromptSchema = require('./StudyPrompt');

const StudySchema = new Schema({
    name: {type: String, required: true},
    instructions: {type: String, required: true},
    description: {type: String, required: true},
    prompts: {type: [String], required: true},
    participants:{type: [StudyParticipantSchema], required: true},
    //prompts: [StudyPromptSchema], --Future implementation
    _user: { type: Schema.Types.ObjectId, ref: 'User'},
    dateCreated: {type: Date, default: Date.now},
    dateModified: {type: Date, default: Date.now}
});
mongoose.model('study', StudySchema);