// const request = require('request');

// // User and password specified like so: node index.js username password.
// let username = process.argv.length < 2 ? "default-username" : process.argv[2];
// let password = process.argv.length < 3 ? "default-password" : process.argv[3];

// let options = {
//     url: "http://localhost:8080/cats",
//     method: "post",
//     headers:
//     { 
//      "content-type": "text/plain"
//     },
//     body: JSON.stringify( {"jsonrpc": "2.0", "id":1, "method": "speak"})
// };

// request(options, (error, response, body) => {
//     if (error) {
//         console.error('An error has occurred: ', error);
//     } else {
//         console.log('Post successful: response: ', body);
//     }
// });

'use strict';

const jayson = require('jayson');

// create a client
const client = jayson.client.http({
  port: 8080
});

// invoke "add"
client.request('list', [1, 1], function(err, response) {
  if(err) throw err;
  console.log(response.result); // 2
});