var sys = require('sys'),
    path = require('path'),
    fs = require('fs'),
    jsmin = require('jsmin').jsmin,
    exec = require('child_process').exec,
    files;

files = ('src/start.js src/helpers.js src/normaliser.js src/base.js '
         + 'src/graphs/base.js src/graphs/bar.js src/graphs/horizontal_bar.js '
         + 'src/graphs/line.js src/graphs/sparkline.js src/graphs/sparkbar.js '
         + 'src/end.js').split(' ');

desc('Builds build/turing.js.');
task('concat', [], function() {
  var filesLeft = files.length,
      pathName = '.',
      outFile = fs.openSync('ico.js', 'w+');
  files.forEach(function(fileName) {
    var fileName = path.join(pathName, fileName),
        contents = fs.readFileSync(fileName);
    fs.writeSync(outFile, contents.toString());
  });
  fs.closeSync(outFile);
});

desc('Minifies with uglify-js');
task('min', ['concat'], function() {
  // uglify-js
  var uglify = require('uglify-js'),
      jsp = uglify.parser,
      pro = uglify.uglify,
      ast = jsp.parse(fs.readFileSync('ico.js').toString()),
      outFile = fs.openSync('ico-min.js', 'w+');
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  fs.writeSync(outFile, pro.gen_code(ast));
});

function lint(file) {
  var JSHINT = require('jshint').JSHINT,
      result = JSHINT(fs.readFileSync(file).toString(), {});
  if (result) {
    console.log(file + ': Lint passed');
  } else {
    console.log(file + ' ERRORS:');
    console.log(JSHINT.errors);
  }
}

desc('Lint');
task('lint', [], function() {
  files.forEach(function(file) {
    if (file.match(/(start|end)\.js/)) return;
    lint(file);
  });

  lint('ico.js');
});

desc('Documentation');
task('docs', [], function() {
  exec('dox --title Ico src/*.js src/graphs/*.js --intro docs/intro.md > docs/index.html');
  exec('cp ico-min.js docs/');
  exec('cp raphael.js docs/');
});

desc('Run tests');
task('tests', [], function() {
  require.paths.unshift('./test/turing-test/lib/');

  fs.readdir('test', function(err, files) {
    files.forEach(function(file) {
      if (file.match(/^[^.](.*)test\.js$/)) {
        try {
          console.log('\n*** ' + file + '\n');
          require('./test/' + file);
        } catch(e) {
        }
      }
    });
  });
});

desc('Main build task');
task('build', ['concat', 'min', 'docs'], function() {});

