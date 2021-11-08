'use strict';

console.clear();

const fs = require('fs').promises;
const path = require('path');

(async function readDir() {
  const list = await fs.readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });

  for await (let item of list) {
    if (item.isFile()) {
      const filePath = path.join(__dirname, 'secret-folder', item.name);

      const stat = await fs.stat(filePath);

      console.log(
        `${path.basename(filePath, path.extname(filePath))} - ${path.extname(filePath).slice(1)} - ${stat.size} bytes`
      );
    };
  };
})();

