/*
 * collect coverage report files
 */
const fs = require('fs');
const path = require('path');

function getSrc(module) {
  return path.join(__dirname, `../packages/${module}/coverage/coverage-final.json`);
}

function getDest(module) {
  return path.join(__dirname, `../coverage/${module}.json`);
}

['data-access', 'request-logic'].map(m => {
  fs.copyFileSync(getSrc(m), getDest(m));
});
