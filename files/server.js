/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const { subscribe } = require('diagnostics_channel');
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = 3000

const ROOT_DIR = 'html' //dir to serve static files from

const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

let usernames = [] //usernames of registered users
let sockets = []//sockets connected and registered (parallel with usernames)
const historyMap = new Map()// key: username; value: object {numberOfMessages, messages themselves(as one string)}
let oldUsernames = []//usernames that were used once before (to know if user logs in first time, or was already registered before)
const MAX_HISTORY = 30;//how many messages can be stored in history


function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/chatClient.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {
  updateClientCount()
  console.log('client connected')

  socket.on('removeHistory', function(data){//called by client when pressed Clear chat and removes history (chat is cleared locally for client)
    if(historyMap.has(data)){
      historyMap.set(data, {historySize: 0, historyString: "history:\n"})
    }
  })

  socket.on('clientSays', function(data) {//when client says message
    console.log('RECEIVED: ' + data)
    data = data.split("///sender:")
    let message = data[0]
    let senderName = data[1]
    console.log("message: " + message)
    if(message.includes(":")){//if there was colon, the message may be private, so need to check
      let tempMessage = message.split(":")//split by colon character. Note there can be few colons, thus several parts
      tempMessage[0] = tempMessage[0].replace(/ /gm, "")//remove all spaces in part before first colon (receivers can only be before first :)
      let possibleUsers = tempMessage[0].split(",") //array of possible usernames
      let atLeastOneFound = false;
      let usersInPrivateRoom = []
      let usersToAppend = ""; //to make "sender -> receivers" string
      console.log("private message receivers:")
      for(let i=0; i<possibleUsers.length; i++){
        for(let j=0; j<usernames.length; j++){
          if(usernames[j].toUpperCase()==possibleUsers[i].toUpperCase()){
            console.log(possibleUsers[i] + " - found")
            usersToAppend+=possibleUsers[i] +", "
            sockets[j].join("privateReceiversRoom")
            usersInPrivateRoom.push(sockets[j])
            atLeastOneFound=true;
          }
        }
      }
      usersToAppend = usersToAppend.substring(0, usersToAppend.length-2)//remove last "," in user list

      if(atLeastOneFound){
        let messageToSend = senderName+ "->" + usersToAppend+": "
        for(let i=1; i<tempMessage.length; i++){//to account for multiple colons (string was splitted by them)
          messageToSend+=tempMessage[i].trim() + ": " 
        }
        messageToSend = messageToSend.substring(0, messageToSend.length-2)//remove last ": "
        console.log("sending private message: "+messageToSend)
        socket.join("privateReceiversRoom")//add sender to this private message too
        io.to("privateReceiversRoom").emit('serverSaysPrivately', messageToSend)

      }else{//if none of the names found, treat just like any other public message
        let messageToSend = senderName+": "+message
        socket.leave("registeredRoom")
        io.to("registeredRoom").emit('serverSays', messageToSend)
        socket.join("registeredRoom")
        socket.emit('ServerSaysOwnMessage', messageToSend)
        addToHistory(messageToSend)
      }
      for(let i=0; i<usersInPrivateRoom.length; i++){//remove all users from room of that private message
        usersInPrivateRoom[i].leave("privateReceiversRoom")
      }
      socket.leave("privateReceiversRoom")//sender leaves too

    }else{//message is not private - just send it to everyone registered
      let messageToSend = senderName+": "+message
      socket.leave("registeredRoom")
      io.to("registeredRoom").emit('serverSays', messageToSend)
      socket.join("registeredRoom")
      socket.emit('ServerSaysOwnMessage', messageToSend)
      addToHistory(messageToSend)//all public messages are added to history (check that function for details)
    }
  })

  socket.on('clientRegisters', function(data){//when user is trying to register (data is username)
    console.log('RECEIVED USERNAME: ' + data)
    let result = ""
    if(usernames.includes(data)){//if user with the same name is logged in, name is taken
      result = "NameIsTaken"
    }else{
      if(data[0].match(/[0123456789]/) || data.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)){//if username starts with number or contains any special character(space too) - incorrect
        result = "IncorrectUserName"
      }else{//else the name is good to be registered
        result = "OK"
        usernames.push(data)//username is now added to chat
        if(oldUsernames.includes(data)){//if username was already registered before
          socket.emit('ServerSaysHistory', historyMap.get(data).historyString)//send history to client
        }else{//if registering for the first time
          historyMap.set(data, {historySize: 0, historyString: "history:\n"})//create new map entry for history
          oldUsernames.push(data)//username is now in use
        }
        sockets.push(socket)//this socket is registered(logged in) now
        socket.emit('serverSays', 'You are connected to CHAT SERVER')//message to client
        io.to("registeredRoom").emit('newUserJoined', 'new user '+ data + ' has joined the chat')//message to everyone to alert about new client
        addToHistory("user "+ data + " has joined the chat")
        socket.join("registeredRoom")
        updateClientCount()
      }
    }
    console.log(result)
    socket.emit('resultOfRegistration', result)
  })

  socket.on('disconnect', function(data) {//when user is leaving
    socket.leave("registeredRoom")//just in case
    //event emitted when a client disconnects
    let index = sockets.indexOf(socket);//check if socket as logged in (if not - change nothing)
    if(index != -1){
      sockets.splice(index, 1)//remove socket from logged sockets list
      let username = usernames.splice(index, 1)//remove username from logged usernames list (and save it)
      console.log('client ' + username + ' disconnected')
      if(username.length>0){
        io.to("registeredRoom").emit('UserDisconnected', 'user '+ username + ' disconnected from the chat')//alert everyone that user left the chat
        // publicHistory+="user "+ username + " disconnected from the chat\n"
        addToHistory("user "+ username + " disconnected from the chat");
      }
      updateClientCount()
    }
  })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)


function addToHistory(message){//add the following public message to history
  for(let i =0; i<oldUsernames.length; i++){//add history only to previously registered users
    if(historyMap.get(oldUsernames[i])==undefined){continue;}
    if(historyMap.get(oldUsernames[i]).historySize<MAX_HISTORY){//if history for particular client is less than specified - just add the message and increase counter
      let string = historyMap.get(oldUsernames[i]).historyString
      let size = historyMap.get(oldUsernames[i]).historySize
      string += message + "\n"
      size++
      historyMap.set(oldUsernames[i], {historySize: size, historyString: string})
    }else{//if equal to - remove the oldest message and add new one
      let string = historyMap.get(oldUsernames[i]).historyString
      let index = string.indexOf("\n")
      let size = historyMap.get(oldUsernames[i]).historySize
      string = string.substring(index+2, string.length)
      string += message + "\n"
      size++
      historyMap.set(oldUsernames[i], {historySize: size, historyString: string})
    }
  }
}

function updateClientCount(){//just sends number of clients to everyone
  io.emit('serverSaysClientCount', sockets.length)
}