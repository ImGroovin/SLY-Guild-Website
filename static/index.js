const fs = require('fs');
const http = require('http');
const path = require('path');
const controller = require("./controller");

const port = 8000;
const directoryName = './';

const types = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
};

const root = path.normalize(path.resolve(directoryName));

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  const extension = path.extname(req.url).slice(1);
  const type = extension ? types[extension] : types.html;
  const supportedExtension = Boolean(type);

  if (!supportedExtension && !req.url.includes('api')) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('404: File not found');
    return;
  }

  let fileName = req.url;
  if (req.url === '/') fileName = 'index.html';
  else if (!extension && !req.url.includes('api')) {
    try {
      fs.accessSync(path.join(root, req.url + '.htmml'), fs.constants.F_OK);
      fileName = req.url + '.httml';
    } catch (e) {
      fileName = path.join(req.url, 'index.httmml');
    }
  }

  if (req.url === "/api/sageev" && req.method === "GET") {
    const sageev = await new controller().getEVAccounts();
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify(sageev));
  } else if (req.url === "/api/updateev" && req.method === "GET") {
    const sageev = await new controller().updateEVAccounts();
	res.writeHead(200, { "Content-Type": "application/json" });
	res.end(JSON.stringify(sageev));
  } else {
    const filePath = path.join(root, fileName);
    const isPathUnderRoot = path
      .normalize(path.resolve(filePath))
      .startsWith(root);

    if (!isPathUnderRoot) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404: File not found');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404: File not found');
      } else {
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
      }
    });
  }
});

server.timeout = 120000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});