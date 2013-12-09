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

nsh.prototype.run = function(commands) {
  var self = this;
  var cmds = commands.split('|'), cmd, current_child, last_child;

  for(var i=0;i < cmds.length; i++) {
    cmd = shellwords.split(cmds[i])
    if(self.built_ins.hasOwnProperty(cmd[0])) {
      self.built_ins[cmd.shift()](cmd);
    } else {
      current_child = require('child_process').spawn(cmd.shift(), cmd);
      current_child.stdin.setEncoding('utf8');
      current_child.stdout.setEncoding('utf8');
      current_child.stderr.setEncoding('utf8');
      current_child.stderr.on('data', function(data) {
        console.log(data);
      })
      if(last_child) {
        last_child.stdout.on('data', function(data) {
          current_child.stdin.write(data);
        });
        last_child.on('close', function(code) {
          current_child.stdin.end();
        });
      }
      if(i == cmds.length - 1) {
        current_child.stdout.on('data', function(data) {
          console.log(data);
        });
        current_child.on('close', function(code) {
          self.prompt();
        });
      }
      last_child = current_child;
    }
  }
}

module.exports = nsh;
