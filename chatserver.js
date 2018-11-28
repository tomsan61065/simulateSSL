var net = require('net')
const ecies = require("eth-ecies");
const keccak256 = require("js-sha3").keccak256;
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

var HOST = '127.0.0.1'
var PORT = 6688
var timeOut = 5000;

var clientList = []

var server = net.createServer();

server.on('connection', function(client) {
    clientList.push(client);
    client.name = client.remoteAddress + ":" + client.remotePort
//    broadcast('him ' + client.name + ' join in!\r\n', client)
//    client.write('hi, ' + client.name + '!\r\n')

    setTimeout(function(){
        client.end();
        console.log("time's up! server clost client");
    }, timeOut);

    var counter = 0;
    var address = "";
    var symKey = "";
    client.on('data', function (data) {
//        broadcast(client.name + ' say:' + data + '\r\n', client)
        console.log(data.toString());
        
        console.log(counter);

        if(counter === 0){
            let strlen = data.toString().length;
            if(strlen !== 128 && strlen !== 130 ){
                client.write("eth publickey format error");
                client.end();
            }else{ //防止上面關了下面還想 send 的 error 出現
                publicKey = data.toString();
                if(publicKey.length === 130){ //remove "0x"
                    publicKey = publicKey.substring(2);
                }
                address = publicToAddress(Buffer(publicKey, "hex"));
                symKey = crypto.randomBytes(256).toString("base64");
            //    console.log(symKey);
                let returnData = encrypt(publicKey, symKey);
            //    console.log(returnData);
                setTimeout(function(){
                    // return publicKey encrypted aes key
                    client.write(returnData);
                }, 500);
            }
        }else if(counter === 1){
            let compareAddress = CryptoJS.AES.decrypt("data.toString()", symKey).toString(CryptoJS.enc.Utf8);
            //console.log("orig:" + address);
            //console.log("tran:" + compareAddress);
            if(compareAddress === address){
                console.log("true");
            }else{
                console.log("false");
            }
            client.end();
        }
        
        counter++;
    })

    client.on('end', function () {
//        broadcast('hi,' + client.name + ' quit!\r\n', client)
        console.log('hi,' + client.name + ' quit!\r\n');
        clientList.splice(clientList.indexOf(client), 1)
    })

    client.on('error', function(err) {
        console.log(err);
    })
})

function encrypt(publicKey, data) {
    
    let userPublicKey = new Buffer.from(publicKey, 'hex');
    let bufferData = new Buffer(data);
  
    let encryptedData = ecies.encrypt(userPublicKey, bufferData);
  
    return encryptedData.toString('base64')
}

function publicToAddress(pubKey){
    // step 2:  public_key_hash = Keccak-256(public_key)
    const public_key_hash = keccak256(pubKey);

    // step 3:  address = ‘0x’ + last 20 bytes of public_key_hash
    let address = "0x" + public_key_hash.substring(public_key_hash.length - 40, public_key_hash.length);

    return address;
}

server.listen(PORT, HOST)
console.log("server listen at " + HOST + ":" + PORT);