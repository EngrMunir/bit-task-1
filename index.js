const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the webhook server!');
});

app.post('/webhook', async (req, res) => {
    // Log the full body to examine the structure
    console.log('Received Full Body:', JSON.stringify(req.body, null, 2));

    const formData = req.body.answer;
    const formQuestions = req.body.form.questions;

    // Create a map for question IDs to their questions
    const questionMap = formQuestions.reduce((map, question) => {
        map[question._id] = question.question;
        return map;
    }, {});

    // Log the answers array to inspect its structure
    console.log('Answers:', JSON.stringify(formData.answers, null, 2));

    // Extract formName and formActive from the answers
    const formName = formData.answers.find(answer => questionMap[answer.q] === 'formName')?.t || 'Unnamed Form';
    const formActive = formData.answers.find(answer => questionMap[answer.q] === 'formActive')?.c?.[0]?.t === 'Yes' || false;

    console.log('Form Name:', formName);
    console.log('Form Active:', formActive);

    // Send data to 123FormBuilder to create a new form
    try {
        const response = await createFormOn123(formName, formActive);
        res.status(200).json({ message: 'Form created on 123FormBuilder', data: response.data });
    } catch (error) {
        console.error('Error creating form on 123FormBuilder:', error);
        res.status(500).json({ message: 'Failed to create form on 123FormBuilder' });
    }
});


// Function to send form data to 123FormBuilder
async function createFormOn123(formName, formActive) {
    const url = 'https://api.123formbuilder.com/v2/forms';

    const data = {
        name: formName,
        active: formActive
    };

    const headers = {
        Authorization: `Bearer YOUR_123FORMBUILDER_API_TOKEN`, // Replace with your API token
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response;
    } catch (error) {
        console.error('Error creating form on 123FormBuilder:', error);
        throw error;
    }
}


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
