function sendMessage() {//sends typed message to server
    if(canChat){//if already logged in
      let message = document.getElementById('msgBox').value.trim()
      if(message === '') return //do nothing
      let sender = "///sender:"+myUserName//add sender username
      message+=sender
      socket.emit('clientSays', message)
      document.getElementById('msgBox').value = ''
    }
  }
  
  function register() {//just sends typed username to server (reply is handled by other function)
    if(canRegister){//if hasn't logged in yet
      let message = document.getElementById('nameField').value.trim()
      myUserName = message
      if(message === '') return //do nothing
      socket.emit('clientRegisters', message)
      document.getElementById('nameField').value = ''
    }
  }
  
  function clearMSGs() {//clear chat locally...
      let message = document.getElementById('messages')
      let children = message.childNodes
      for(let i=children.length-1; i>=0; i--){
        message.removeChild(children.item(i))
      }
      message.removeChild;
      socket.emit('removeHistory', myUserName)//...and say server to delete history
  }