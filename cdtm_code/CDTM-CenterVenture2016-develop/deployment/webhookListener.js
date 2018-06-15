var express = require('express');
var app = module.exports = express();
var exec = require('child_process').spawn;

app.use(express.bodyParser());

app.post('/', function(req, res) {
   console.log("Received Stuff");
   console.log(req.body);

   // only pull if it's the master branch
   if (req.body != undefined && req.body.ref == 'refs/heads/master') {
     console.log("Pulling...");
     child = spawn(process.argv[0], ['deploy.js'], {
       detached: true,
       stdio: 'ignore'
     });
   }
});

app.listen(9999, function(){
  console.log("The github server listening on port 9999" );
});
