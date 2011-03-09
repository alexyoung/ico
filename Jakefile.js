var exec = require('child_process').exec;

desc('Updates the documentation from GitHub');
task('docs', [], function() {
  exec('curl -O https://github.com/alexyoung/ico/raw/master/docs/index.html');
  exec('curl -O https://github.com/alexyoung/ico/raw/master/docs/examples.html');
  exec('curl -O https://github.com/alexyoung/ico/raw/master/docs/ico-min.js');
  exec('curl -O https://github.com/alexyoung/ico/raw/master/docs/raphael.js');
});

