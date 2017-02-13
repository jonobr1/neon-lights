var marked = require('marked');
var path = require('path');
var fs = require('fs');

fs.readFile(path.resolve(__dirname, '../readme.md'), { encoding: 'utf8'}, function(err, contents) {

  if (err) {
    throw err;
  }

  var markdown = [
    '<!doctype html><head><title>Neon Lights: Instructions</title>',
    '<link type="text/css" rel="stylesheet" href="./release/styles/github-markdown.css">',
    '</head><body class="markdown-body">',
    marked(contents),
    '</body></html>'
  ].join('');

  fs.writeFile(path.resolve(__dirname, '../index.html'), markdown, function(err) {

    if (err) {
      throw err;
    }

    console.log('readme.md compiled with markdown.');

  });

});
