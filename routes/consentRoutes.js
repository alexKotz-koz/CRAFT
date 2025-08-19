const mongoose = require('mongoose');
const Consent = mongoose.model('Consent');
const User = mongoose.model('User');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');

module.exports = (app) => {
    app.post('/api/consent/new', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        try {
            const { studyName, consent, participants } = req.body;

            if (!studyName || !consent) {
                return res.status(400).send('studyName and consent are required.');
            }
            if (!Array.isArray(participants)) {
                return res.status(400).send('participants must be an array.');
            }

            const valid = participants.every(p => p && p._id && p.email && p.username);
            if (!valid) {
                return res.status(400).send('participants must contain {_id, email, username}.');
            }

            const doc = new Consent({ studyName, consent, participants });
            const saved = await doc.save();
            res.status(201).json(saved);
        } catch (err) {
            console.error('Error creating new consent form: ', err);
            res.status(500).send('Server error creating consent.');
        }
    });
    app.get('/api/consent/get-status', requireLogin, async (req, res) => {
        try {
            const allConsents = await Consent.find();
            res.send(allConsents);

        } catch (err) {
            console.error('Error fetching consent statuses: ', err);
            res.status(500).send('Server error fetching consent statuses.')
        }
    });
    app.post('/api/consent/update-status', requireLogin, async (req, res) => {
        const { userId, consentId } = req.body;

        try {
            const update = await Consent.findOneAndUpdate(
                { _id: consentId, 'participants._id': userId },
                { $set: { 'participants.$.consent': true } },
                { new: true, runValidators: true, context: 'query' }
            );

            if (!update) {
                return res.status(404).send('Participant not found.');
            }
            res.status(200).json(update);
        } catch (err) {
            console.error("Error updating consent status: ", err);
            res.status(500).send('Server error updating consent status');
        }

    });
    app.post('/api/consent/assign', requireLogin, requireFacilitatorPermissions, async (req, res) => {
        const { consentId, participantIds } = req.body;
    
        if (!consentId || !Array.isArray(participantIds) || participantIds.length === 0) {
            return res.status(400).send('consentId and participantIds[] are required.');
        }
    
        try {
            // Fetch user info for each participant
            const users = await User.find({ _id: { $in: participantIds } });
            const newParticipants = users.map(u => ({
                _id: u._id,
                email: u.email,
                username: u.username,
                consent: false
            }));
    
            // Add to participants array, avoiding duplicates
            const update = await Consent.findByIdAndUpdate(
                consentId,
                { $addToSet: { participants: { $each: newParticipants } } },
                { new: true, runValidators: true }
            );
    
            if (!update) {
                return res.status(404).send('Consent not found.');
            }
            res.status(200).json(update);
        } catch (err) {
            console.error("Error assigning new participant: ", err);
            res.status(500).send('Server error assigning new participant to consent');
        }
    });
};