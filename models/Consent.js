const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const StudyParticipantSchema = require('./StudyParticipant');

const ConsentSchema = new Schema({
    studyName: { type: String, required: true },
    consent: { type: String, required: true },
    participants: { type: [StudyParticipantSchema], required: true }
});

mongoose.model('Consent', ConsentSchema);