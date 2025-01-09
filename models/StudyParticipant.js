const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyParticipantSchema = new Schema({
    email: {type: String, required: true},
    userName: {type: String, required: true},
});

module.exports = studyParticipantSchema;