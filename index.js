var express = require('express');
var app = express();

app.use( '/static', express.static( __dirname ) );

app.listen( 3000, function () {
  console.log('Zenplaces listening on port 3000!');
  console.log('Base directory: ' + __dirname );
  console.log('Launch: http://localhost:3000/static/index.html');
});