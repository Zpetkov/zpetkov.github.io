const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 8940;

var logging = false;

const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

http.createServer(function (request, response) {
  if (logging) {
    console.log(`${request.method} ${request.url}`);
  }

  const parsedUrl = url.parse(request.url);
  let pathname = `.${parsedUrl.pathname}`;
  const extension = path.parse(pathname).ext;

  fs.exists(pathname, function (exist) {
    if (!exist) {
      response.statusCode = 404;
      response.end(`File ${pathname} not found!`);
      return;
    }

    if (fs.statSync(pathname).isDirectory()) pathname += '/index' + extension;

    fs.readFile(pathname, function (err, data) {
      if (err) {
        response.statusCode = 500;
        response.end(`Error getting the file: ${err}.`);
      } else {
        response.setHeader('Content-type', contentTypes[extension] || 'text/plain');
        response.end(data);
      }
    });
  });


}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);