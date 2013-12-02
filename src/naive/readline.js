var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


rl.question(' $ ', function(data) {
  console.log(data);
});

