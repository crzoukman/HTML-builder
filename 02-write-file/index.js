'use strict';

console.clear();

const fs = require('fs');
const path = require('path');
const { stdin } = require('process');

fs.createWriteStream(path.join(__dirname, 'file.txt'), 'utf-8');

console.log('Hey! Say something below:');

stdin.on('data', (data) => {
  const dataX = data.toString().trim();
  if (dataX === 'exit') {
    console.log('You\'re done!');
    process.exit(0);
  };

  fs.appendFile(path.join(__dirname, 'file.txt'), data, (err) => {
    if (err) throw err;
  });
});

process.on('SIGINT', () => {
  console.log('You\'re done!');
  process.exit(0);
});

