//Create By Zik 13-03-2020
//inisialisasi standar node js
const http = require('http');
//inisialisasi middleware
const helmet = require('helmet');
const bodyParser = require('body-parser');
//inisialisasi framework nodejs
const express = require('express');
const app = express();
//menghubungkan nodejs ke http
const server = http.Server(app);
//inisialisasi port
const port = 8080;
//inisialisasi data dari Nominations.json
var data = require("./data/Nominations.json")
    //inisialisasi library JSONRPC
const jayson = require("jayson");
//inisialisasi socket.io
const io = require("socket.io")(server);
//inisialisasi current user
var clients = [];
//memasang middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//menentukan header dan batasan pada endpoint
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    next();
});
//variable yang nanti digunakan client melalui JSONRPC
const vote = {
        vote: function(args, callback) {
            //socket id user diambil dan memulai proses voting
            var socketIndex = getIndexMacAddress(args[0].macaddress);
            console.log(data.data[args[0].idnominations - 1]
                .nominations[args[0].idnominator - 1]);
            if (socketIndex != undefined && !clients[socketIndex].voteBool) {

                data.data[args[0].idnominations - 1]
                    .nominations[args[0].idnominator - 1].vote =
                    data.data[args[0].idnominations - 1]
                    .nominations[args[0].idnominator - 1].vote + 1;
                //menghitung ulang persentasi dari semua nominasi
                getPercentage(args[0].idnominations - 1, );
                //mengirim data terbaru setalah voting
                callback(null, {
                    status: 1,
                    message: "Succesfully Vote",
                    params: args == undefined ? 1 : args[0]
                });
                io.emit('update', data);
                console.log("Nominations Voted");
            } else
            //mengirim pesan jika tidak berhasil vote
                callback(null, {
                status: 0,
                message: "Failed Vote",
                params: args == undefined ? 1 : args[0]
            })
        }
    }
    //pemasangan socket dan handler jika ada user yang connect
io.sockets.on('connection', (socket) => {
        console.log("New User Connected");
        //menerima request dari client jika dia meminta saveCustomId
        socket.on("SaveCustomId", function(body) {
                //menyimpan data data user ke variable client
                var socketIndex = getIndexMacAddress(JSON.parse(body).macAddress);
                console.log(socketIndex);
                if (socketIndex == undefined) {
                    var clientInfo = new Object();
                    clientInfo.macAddress = JSON.parse(body).macAddress;
                    clientInfo.socketId = socket.id;
                    clientInfo.voteBool = false;
                    clients.push(clientInfo);
                } else {
                    clients[socketIndex].socketId = socket.id;
                }
                //mengirim pesan berhasil
                socket.emit('message', data);
            })
            //menerima request getListNomination dari client
        socket.on("getListNominations", function(data) {
                //mengambil socket id dan mengirimkan data terbaru 
                var socketId = getSocketId(data.macAddress);
                if (socketId != undefined) {
                    socket.to(socketId).emit('message', data);
                }
            })
            //handler jika ada client yang disconnect 
        socket.on('disconnect', function(data) {
            //menghapus data client di variable client
            var socketIndex = getIndexMacAddress(data.macAddress);
            if (socketIndex != undefined) {
                clients[socketIndex].socketId == undefined;
            }
            console.log("a user Disconnected");
        })
    })
    //memasang const vote ke endpoint dengan method post
app.post('/', jayson.server(vote).middleware())

//server mulai mendengarkan request
server.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log("NodePoints Worked Now !!");
})

//method untuk mengambil socket id berdasarkan mac address
function getSocketId(macAddress) {
    for (x in clients) {
        if (x.macAddress == macAddress)
            return x.socketId;
        else return undefined;
    }
}

//method untuk mengambil index berdasarkan mac address
function getIndexMacAddress(macAddress) {
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].macAddress == macAddress)
            return i;
        else return undefined;
    }
}
//method untuk menghitung ulang persentasi setiap nominasi
function getPercentage(idnominations) {
    var counter = 0;
    for (var i = 0; i < data.data[idnominations].nominations.length; i++) {
        counter += data.data[idnominations].nominations[i].vote
    }
    counter = counter == 0 ? 10 : counter;
    for (var j = 0; j < data.data[idnominations].nominations.length; j++) {
        data.data[idnominations].nominations[j].percentage =
            Math.round((data.data[idnominations].nominations[j].vote / counter) * 100) + "%"
    }
}