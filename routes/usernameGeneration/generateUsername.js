const fs = require('fs');
const path = require('path');

function getRandomWordFromFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const words = data.split('\n').map(word => word.trim()).filter(word => word.length > 0);
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

function getRandomWords() {
    const adjectivesFile = path.join(__dirname, 'adjectives.csv');
    const nounsFile = path.join(__dirname, 'nouns.csv');

    const randomAdjective = getRandomWordFromFile(adjectivesFile);
    const randomNoun = getRandomWordFromFile(nounsFile);

    return {
        adjective: randomAdjective,
        noun: randomNoun
    };
}

module.exports = getRandomWords;
