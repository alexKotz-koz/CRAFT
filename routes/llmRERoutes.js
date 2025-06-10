const mongoose = require('mongoose');
const { LLMResponseEvaluation, FullLLMResponseEvaluation, SectionsLLMResponseEvaluation } = require('../models/LLMResponseEvaluation');

const requireLogin = require('../middlewares/requireLogin');
const requireFacilitatorPermissions = require('../middlewares/requireFacilitatorPermissions');

module.exports = (app) => {
    app.post('/api/llm-response-evaluation/create', requireFacilitatorPermissions, requireLogin, async (req, res) => {
        const { title, instructions, llmOutput, rubricItems } = req.body;
        console.log(rubricItems)
        try {
            let evaluation;
            if (Array.isArray(llmOutput)) {
                evaluation = new SectionsLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    llmOutput,
                    rubricItems
                });
            } else if (typeof llmOutput === "string") {
                evaluation = new FullLLMResponseEvaluation({
                    user: req.user._id,
                    title,
                    instructions,
                    llmOutput,
                    rubricItems
                });
            } else {
                return res.status(400).send("Invalid llmOutput type");
            }

            await evaluation.save();
            res.status(201).json(evaluation);
        } catch (error) {
            console.error("Error creating evaluation: ", error);
            res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/all', async (req, res) => {
        try {
            const allLLMREs = await LLMResponseEvaluation.find();
            res.send(allLLMREs);
        } catch (err) {
            return res.status(500).send("Internal Server Error");
        }
    });

    app.get('/api/llm-response-evaluation/:llmreId', requireLogin, async (req, res) => {
        const { llmreId } = req.params;

        try {
            const llmre = await LLMResponseEvaluation.findById(llmreId);
            console.log(llmre)
        } catch (err) {
            console.error("Error fetching LLM Response Evaluation:", err);
            res.status(422).send(err);
        }

    });
};