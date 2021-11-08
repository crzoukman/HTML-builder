'use strict';

console.clear();

const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, 'styles');

async function getSylesList(pathFrom) {
  const list = await fsPromises.readdir(pathFrom, { withFileTypes: true });
  const listX = [];

  for await (const item of list) {
    const ext = path.extname(path.join(pathFrom, item.name));
    const basename = path.basename(path.join(pathFrom, item.name), ext);

    if (item.isFile() && ext.slice(1) === 'css') {
      listX.push([basename, ext.slice(1)]);
    }
  };



  return listX;
};


async function merge(pathFrom, list) {
  const ws = fs.createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'), 'utf-8');


  const streams = [];
  let counter = 0;

  for (const item of list) {
    streams.push(fs.createReadStream(path.join(pathFrom, `${item[0]}.${item[1]}`), 'utf-8'));
  };

  while (counter < streams.length) {
    for await (const chunk of streams[counter]) {
      ws.write(chunk, (err) => {
        if (err) throw err;
      });
    };

    counter++;
  };


};

async function remover(from) {
  const list = await readDir(from);

  for await (const item of list) {
    if (item.isFile()) {
      await fsPromises.unlink(path.join(from, item.name));
    } else {
      remover(path.join(from, item.name));
    };
  };
};

async function emptyFolderRemover(from) {
  const list = await readDir(from);

  for await (const item of list) {

    if (!item.isFile()) {
      const info = await fsPromises.readdir(path.join(from, item.name));

      if (!item.isFile() && info.length === 0) {
        await fsPromises.rmdir(path.join(from, item.name));
      } else if (!item.isFile()) {
        emptyFolderRemover(path.join(from, item.name));
      };
    };

  };
};

async function readDir(path) {
  const list = await fsPromises.readdir(path, { withFileTypes: true });

  return list;
};

async function makeDir(path) {
  await fsPromises.mkdir(path, { recursive: true });
};

(async function () {
  //await makeDir(path.join(__dirname, 'project-dist'));

  //await remover(path.join(__dirname, 'project-dist'));

  //await emptyFolderRemover(path.join(__dirname, 'project-dist'));

  const list = await getSylesList(from);

  merge(from, list);

})();


