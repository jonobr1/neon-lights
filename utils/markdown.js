var marked = require('marked');
var path = require('path');
var fs = require('fs');

fs.readFile(path.resolve(__dirname, '../readme.md'), { encoding: 'utf8'}, function(err, contents) {

  if (err) {
    throw err;
  }

  var markdown = marked(contents);

  fs.writeFile(path.resolve(__dirname, '../index.html'), markdown, function(err) {

    if (err) {
      throw err;
    }

    console.log('readme.md compiled with markdown.');

  });

});
