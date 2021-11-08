'use strict';

console.clear();

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// ------------------- global vars
const to = path.join(__dirname, 'project-dist');
const from = path.join(__dirname, 'styles');

// ---------------------- make dir
async function makeDir(where) {
  await fsPromises.mkdir(where, { recursive: true });
};


// ------------------------ copy styles


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
  const ws = fs.createWriteStream(path.join(to, 'style.css'), 'utf-8');

  const streams = [];
  let counter = 0;

  for await (const item of list) {
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


// ------------- html builder
async function htmlBuilder(from, to) {
  let template = await fsPromises.readFile(from, 'utf-8');

  const matched = template.match(/\{{(.*?)\}}/g);
  const matchedNames = matched.map(e => e.substring(2, e.length - 2));

  matchedNames.forEach((ph, i) => {
    fs.readFile(path.join(__dirname, 'components', ph + '.html'), 'utf-8', (err, data) => {
      if (err) throw err;
      template = template.replace(`${matched[i]}`, data);

      if (i === matchedNames.length - 1) {
        fs.writeFile(path.join(to, 'index.html'), template, (err) => {
          if (err) throw err;
        });
      };
    });

  });

};

// ----------------------- copy assets
async function copyAssets(from, to) {


  await fsPromises.mkdir(to, { recursive: true });


  fs.readdir(from, { withFileTypes: true }, (err, list) => {

    if (err) throw err;

    for (const item of list) {

      if (item.isFile()) {
        fs.copyFile(path.join(from, item.name), path.join(to, item.name), (err) => {

          if (err) throw err;
        });
      } else {
        copyAssets(path.join(from, item.name), path.join(to, item.name));
      };
    };
  });
};


// ------------------------ removers

async function readDir(path) {
  const list = await fsPromises.readdir(path, { withFileTypes: true });

  return list;
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

// -------------- execute
(async function () {
  await makeDir(to);

  await remover(path.join(__dirname, 'project-dist'));

  await emptyFolderRemover(path.join(__dirname, 'project-dist'));

  const list = await getSylesList(from);
  merge(from, list);
  htmlBuilder(path.join(__dirname, 'template.html'), to);
  copyAssets(path.join(__dirname, 'assets'), path.join(to, 'assets'));
})();



