function handleKeyDown(event) {
    const ENTER_KEY = 13 //keycode for enter key
    if (event.keyCode === ENTER_KEY) {//treat enter key differently
      let selectedID=document.activeElement.id
      if(selectedID=="msgBox"){//if user was typing message (msgBox is still selected element)
        sendMessage()
      }else if(selectedID=="nameField"){//if user was typing name
        register()
      }
      return false //don't propogate event
    }
  }
  
  
  
  //Add event listeners
  document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
  
    //add listener to buttons
    document.getElementById('send_button').addEventListener('click', sendMessage)
    document.getElementById('register_button').addEventListener('click', register)
    document.getElementById('clear_button').addEventListener('click', clearMSGs)
  
    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
    //document.addEventListener('keyup', handleKeyUp)
  })