const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    type: {
        type: String,
        enum: ['clairfy', 'upvote', 'downvote', 'comment'],
        required: true
    },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment'},
    initialResponse: { type: Schema.Types.ObjectId, ref: 'StudyResponse'},
    task: { type: Schema.Types.ObjectId, ref: 'StudyTask'},
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['unread', 'read', 'clairfy-pending-approval', 'clairfy-approved']
    },
    _dateCreated: { type: Date, default: Date.now},
});

mongoose.model('Notification', NotificationSchema);
module.exports = NotificationSchema;