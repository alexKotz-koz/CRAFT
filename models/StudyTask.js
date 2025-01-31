const mongoose = require('mongoose');
const { Schema } = mongoose;
const StudyParticipantSchema = require('./StudyParticipant');

const StudyTaskSchema = new Schema({
    name: { type: String, required: true },
    instructions: { type: String, required: true },
//    type: { type: String, enum: ['text', 'media', 'link'], required: true },
    mediaLink: { type: String },
    linkLink: { type: String },
    prompts: [{ type: Schema.Types.ObjectId, ref: 'StudyPrompt' }],
    //responses: [{ type: Schema.Types.ObjectId, ref: 'StudyResponse' }],
    participants: { type: [StudyParticipantSchema], required: true },
    study: { type: Schema.Types.ObjectId, ref: 'Study', required: true },
    _createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    _dateCreated: { type: Date, default: Date.now, required: true }
});

mongoose.model('StudyTask', StudyTaskSchema);