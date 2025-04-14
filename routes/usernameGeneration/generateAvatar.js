function generateAvatar(username) {
    const initials = username.split('-').map(name => name[0]).join('');
    
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    const canvasElement = createCanvas(100, 100);
    const context = canvasElement.getContext('2d');

    // Background color
    context.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
    context.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Text
    context.fillStyle = '#FFFFFF';
    context.font = '50px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials.toUpperCase(), canvasElement.width / 2, canvasElement.height / 2);

    return canvasElement.toDataURL();
}

module.exports = generateAvatar;