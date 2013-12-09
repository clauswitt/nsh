var spawn = require("child_process").spawn,
    readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function nsh_prompt() {
  rl.question(' $ ', function(data) {
    process.stdin.pause();
    data = data.split(/ /);
    var cmd = require('child_process').spawn(data.shift(), data, {stdio: 'inherit'});
    cmd.on('close', function() {
      process.stdin.resume();
      nsh_prompt();
    });
  });
}

nsh_prompt();

