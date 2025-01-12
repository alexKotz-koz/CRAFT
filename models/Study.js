const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyParticipantSchema = require('./StudyParticipant');

const StudySchema = new Schema({
    name: { type: String, required: true },
    instructions: { type: String, required: true },
    description: { type: String, required: true },
    participants: { type: [StudyParticipantSchema], required: true },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'StudyPrompt' }], // Reference to StudyPrompt
    responses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse' }],
    _user: { type: Schema.Types.ObjectId, ref: 'User' },
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now }
});

mongoose.model('Study', StudySchema);