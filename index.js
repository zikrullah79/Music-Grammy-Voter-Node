//Create By Zik 13-03-2020

const http = require('http');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const server = http.Server(app);
const port = 8080;
var data = require("./data/Nominations.json")
const jayson = require("jayson");
const io = require("socket.io")(server);
var clients = [];
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
} );

// var vote_amount = [];
// for(var i = 0 ; i < data.data.length;i++){
//     var temp = [];
//     for (var j = 0 ; j<data.data[i].nominations.length;j++) {
//         temp.push(0);
//     }
//     vote_amount.push(temp);
// }
const vote = {
    vote: function(args, callback) {
        // callback(null, data);
        var socketIndex = getIndexMacAddress(args[0].macaddress);
        console.log(data.data[args[0].idnominations-1]
            .nominations[args[0].idnominator-1]);
        if(socketIndex != undefined && !clients[socketIndex].voteBool){
            
            data.data[args[0].idnominations-1]
            .nominations[args[0].idnominator-1].vote = 
            data.data[args[0].idnominations-1]
            .nominations[args[0].idnominator-1].vote + 1;
            
            getPercentage(args[0].idnominations-1,); 
            
            // vote_amount[args[0].idnominations][args[0].idnominator] += 1; 
            callback(null,{
                status : 1,
                message : "Succesfully Vote",
                params: args == undefined ? 1 : args[0]
            });
            io.emit('update',data);
            console.log("Nominations Voted");
        }else
            callback(null,{
                status : 0,
                message : "Failed Vote",
                params: args == undefined ? 1 : args[0]
            })
        // console.log(data.data[args[0].idnominations]
        //     .nominations[args[0].idnominator].vote +" = "+
        //     vote_amount[args[0].idnominations][args[0].idnominator])
    }
}

// app.get('/',function(req,res){
//     res.send('hello world');
//     console.log("Client Connected");
// })

io.sockets.on('connection',(socket)=>{
    console.log("New User Connected");

    socket.on("SaveCustomId",function(body){
        var socketIndex = getIndexMacAddress(JSON.parse(body).macAddress); 
        console.log(socketIndex);
        if(socketIndex == undefined){
            var clientInfo = new Object();
            clientInfo.macAddress = JSON.parse(body).macAddress;
            clientInfo.socketId = socket.id;
            clientInfo.voteBool = false;
            clients.push(clientInfo);
        }else{
            clients[socketIndex].socketId = socket.id;
        }
        socket.emit('message',data);
    })
    socket.on("getListNominations",function(data){
        var socketId = getSocketId(data.macAddress);
        if(socketId != undefined){
            socket.to(socketId).emit('message',data);
        }
    })

    socket.on('disconnect',function(data){
        var socketIndex = getIndexMacAddress(data.macAddress);
        if(socketIndex != undefined){
            clients[socketIndex].socketId == undefined;
        }
        console.log("a user Disconnected");
    })
})
app.post('/',jayson.server(vote).middleware())

server.listen(port,(err)=>{
    if(err){
        throw err;
    }
    console.log("NodePoints Worked Now !!");
})

function getSocketId(macAddress){
    for(x in clients){
        if(x.macAddress == macAddress)
            return x.socketId;
        else return undefined;
    }
}

function getIndexMacAddress(macAddress){
    for(var i = 0; i < clients.length;i++){
        if(clients[i].macAddress == macAddress)
            return i;
        else return undefined;
    }
}
function getPercentage(idnominations){
    var counter = 0;
    for(var i = 0; i < data.data[idnominations].nominations.length;i++){
        counter += data.data[idnominations].nominations[i].vote
    }
    counter = counter == 0 ? 10 : counter;
    for(var j = 0 ; j < data.data[idnominations].nominations.length;j++){
        data.data[idnominations].nominations[j].percentage = 
        Math.round((data.data[idnominations].nominations[j].vote / counter)*100) +"%"
    }
}
