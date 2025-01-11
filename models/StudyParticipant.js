const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyParticipantSchema = new Schema({
    email: {type: String, required: true},
    username: {type: String, required: true},
    responded: {type: Boolean, default: false},
});

module.exports = studyParticipantSchema;