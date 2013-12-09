var spawn = require("child_process").spawn,
    readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var shellwords = require("shellwords");


var nsh = function nsh() {
  self = this;
  this.built_ins = {
    'cd': function(path) {
      process.chdir(path[0]);
      self.prompt();
    },
    'pwd': function() {
      console.log(process.cwd());
      self.prompt();
    },
    'echo': function(msg) {
      console.log(msg.join(' '));
      self.prompt();
    }
  };
}

nsh.prototype.prompt = function() {
  process.stdin.resume();
  var self = this;
  rl.question(' $ ', function(data) {
    process.stdin.pause();
    self.run(data);
  });
}

nsh.prototype.run = function(cmd) {
  var self = this;
  cmd = shellwords.split(cmd);
  if(self.built_ins.hasOwnProperty(cmd[0])) {
    self.built_ins[cmd.shift()](cmd);
  } else {
    self.execute_external(cmd.shift(), cmd);
  }
}

nsh.prototype.execute_external = function(cmd, args) {
    var self = this;
    var cmd = require('child_process').spawn(cmd, args, {stdio: 'inherit'});
    cmd.on('close', function() {
      process.stdin.resume();
      self.prompt();
    });
}

var shell = new nsh;
shell.prompt();
