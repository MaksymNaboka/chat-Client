//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page
let myUserName =""
let canChat = false
let canRegister = true

socket.on('serverSays', function(message) {//got public message (regular text (black))
  let msgDiv = document.createElement('div')
  msgDiv.textContent = message
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('serverSaysClientCount', function(message) {//update logged clients count
  let counter = document.createElement('p')
  counter.textContent = message
  if(document.getElementById('counter').childNodes.length>1){//if already has some counter, delete it
    document.getElementById('counter').removeChild(document.getElementById('counter').childNodes.item(1))
  }
  document.getElementById('counter').appendChild(counter)//add counter
})

socket.on('ServerSaysHistory', function(message) {//display message history (grey)
  let messages= message.split("\n")
  for(let i=0; i< messages.length; i++){
    if(messages[i]!=""){
      let msgDiv = document.createElement('div')
      msgDiv.textContent = messages[i]
      msgDiv.style.color = "#94a9b0"
      document.getElementById('messages').appendChild(msgDiv)
    }
  }
})

socket.on('UserDisconnected', function(message) {//display "disconnected" message (yellow)
  let msgDiv = document.createElement('div')
  msgDiv.textContent = message
  msgDiv.style.background = "#e6c770"
  msgDiv.style.color = "#ffffff"
  msgDiv.style.textDecorationLine = "underline"
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('newUserJoined', function(message) {//display "connected" message (orange)
  let msgDiv = document.createElement('div')
  msgDiv.textContent = message
  msgDiv.style.background = "#f29c55"
  msgDiv.style.color = "#ffffff"
  msgDiv.style.textDecorationLine = "underline" 
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('serverSaysPrivately', function(message) {//display private message (red)
  let msgDiv = document.createElement('div')
  msgDiv.textContent = message
  msgDiv.style.color = "#d91b0d"
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('ServerSaysOwnMessage', function(message) {//display own message (blue)
  let msgDiv = document.createElement('div')
  msgDiv.textContent = message
  msgDiv.style.color = "#0d7dd9"
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('resultOfRegistration', function(result){//alert user if:
  if(result=="OK"){//successful registration
    alert("you have successfully registered in the chat, " + myUserName)
    canChat = true
    canRegister = false
  }else if(result=="NameIsTaken"){//username is in use
    alert("username "+ myUserName+ " is already taken")
    myUserName = ""
  }else if(result == "IncorrectUserName"){//username has restricted symbols
    alert("Name cannot start with number\nAnd cannot contain special characters")
    myUserName= ""
  }else{//any unhandled cases
    alert("something went wrong with registration, try again")
    myUserName =""
  }
})