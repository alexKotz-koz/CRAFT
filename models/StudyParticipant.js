const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyParticipantSchema = new Schema({
    email: {type: String, required: true},
    userName: {type: String, required: true},
    responded: {type: Boolean, default: false},
});

module.exports = studyParticipantSchema;