
var net = require('net'); // 引入網路 (Net) 模組
const AES = require("crypto-js").AES;
const ecies = require("eth-ecies");

var HOST = '140.119.163.66';
var PORT = 8087;
var timeOut = 10000;

const publicKey = 'e0d262b939cd0267cfbe3f004e2863d41d1f631ce33701a8920ba73925189f5d15be92cea3c58987aa47ca70216182ba6bd89026fc15edfe2092a66f59a14003';
const privateKey = '55bb4cb6407303de8e4c5a635021d3db12cb537305eeb6401612ce14b35d6690';
const address = "0xa0948b46e6073878e88fe792eefabd2f20440a3c";

var symkey = "";

// 使用 net.connect() 方法，建立一個 TCP 用戶端 instance
var client = net.connect(PORT, HOST, function(){
  console.log('客戶端連線…');

  // 向伺服器端發送資料，該方法其實就是 socket.write() 方法，因為 client 參數就是一個通訊端的物件
  //client.write('client write: 哈囉 Server!');
  //client.write("123454321");
  client.write(publicKey);

  setTimeout(function(){
    client.end();
  }, timeOut);
  
});

// data 事件
client.on('data', function(data){
  //console.log(data.toString());

  // 輸出由 client 端發來的資料位元組長度
  console.log('socket.bytesRead is ' + client.bytesRead);

  // 在列印輸出資料後，執行關閉用戶端的操作，其實就是 socket.end() 方法
  symkey = decrypt(privateKey, data.toString());
  //console.log(symkey);

  setTimeout(function(){
    client.write( AES.encrypt(address, symkey).toString() );
  //  client.write("QWEASD");
  }, 500);
})
.on('error', console.log);

// end 事件
client.on('end', function(){
  console.log('client disconnected');
});


function decrypt(privateKey, encryptedData) {
  let userPrivateKey = new Buffer(privateKey, 'hex');
  let bufferEncryptedData = new Buffer(encryptedData, 'base64');

  let decryptedData = ecies.decrypt(userPrivateKey, bufferEncryptedData);
  
  return decryptedData.toString('utf8');
}