const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyParticipantSchema = require('./StudyParticipant');
const StudyPromptSchema = require('./StudyPrompt');

const studySchema = new Schema({
    studyName: {type: String, required: true},
    instructions: {type: String, required: true},
    participants: [StudyParticipantSchema],
    prompts: [StudyPromptSchema],
    _user: { type: Schema.Types.ObjectId, ref: 'User'},
    dateCreated: Date,
    dateModified: Date
})