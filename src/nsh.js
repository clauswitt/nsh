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
  var self = this;
  process.stdin.resume();
  rl.question(' $ ', function(data) {
    process.stdin.pause();
    self.run(data);
  });
}

nsh.prototype.run = function(commands) {
  var self = this;
  var cmds = commands.split('|'), cmd, current_child, last_child;
  var spawn_options = undefined;
  if (cmds.length == 1) {
    spawn_options = {stdio: 'inherit'}
  }

  for(var i=0;i < cmds.length; i++) {
    cmd = shellwords.split(cmds[i])
    if(self.built_ins.hasOwnProperty(cmd[0])) {
      self.built_ins[cmd.shift()](cmd);
    } else {
      last_child = current_child;
      current_child = require('child_process').spawn(cmd.shift(), cmd, spawn_options);
      if(cmds.length>1) {
        self.set_pipes(last_child, current_child);
        if(i == cmds.length - 1) {
          self.handle_last_command(current_child);
        }
      } else {
        self.listen_for_close_on_last_command(current_child);
      }
    }
  }
}

nsh.prototype.set_pipes = function(last_child, current_child) {
  this.set_encoding_for_pipes(current_child);
  this.set_output_for_stderr(current_child);
  if(last_child) {
    last_child.stdout.on('data', function(data) {
      current_child.stdin.write(data);
    });
    last_child.on('close', function(code) {
      current_child.stdin.end();
    });
  }
}

nsh.prototype.set_output_for_stderr = function(child) {
  child.stderr.on('data', function(data) {
    console.log(data);
  })
}

nsh.prototype.set_encoding_for_pipes = function(child) {
  child.stdin.setEncoding('utf8');
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
}

nsh.prototype.handle_last_command = function(current_child) {
  self = this;
  current_child.stdout.on('data', function(data) {
    console.log(data);
  });
  self.listen_for_close_on_last_command(current_child);
}

nsh.prototype.listen_for_close_on_last_command = function(current_child) {
  current_child.on('close', function(code) {
    self.prompt();
  });
}

module.exports = nsh;
