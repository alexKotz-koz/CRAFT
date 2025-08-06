const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyParticipantSchema = require('./StudyParticipant');

const StudySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    preface: {type: String, required: true},
    participants: { type: [StudyParticipantSchema], required: true },
    type: {
        type: String,
        enum: ['app-review', 'survey']
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'StudyTask' }],
    _createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    _facilitator: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    _dateCreated: { type: Date, default: Date.now }
});

mongoose.model('Study', StudySchema);