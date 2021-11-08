'use strict';

console.clear();

const fs = require('fs').promises;
const path = require('path');

async function makeDir(path) {
  await fs.mkdir(path, { recursive: true });
};

async function readDir(path) {
  const list = await fs.readdir(path);

  return list;
};

async function copyFiles(from, to, list) {
  await removeFiles(to);

  for (const item of list) {
    fs.copyFile(path.join(from, item), path.join(to, item));
  };
};

async function removeFiles(from) {
  const list = await readDir(from);
  for (const item of list) {

    fs.unlink(path.join(from, item));
  };
};

(async function () {
  const pathTo = path.join(__dirname, 'files-copy');
  const pathFrom = path.join(__dirname, 'files');

  await makeDir(pathTo);
  const list = await readDir(pathFrom);

  copyFiles(pathFrom, pathTo, list);
})();

