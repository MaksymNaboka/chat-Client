I also deployed this project to:
https://chat-client.fly.dev
but it is not running 24/7




INSTALL INSTRUCTIONS:
*open terminal in folder containing "server.js" file (files folder)*
run:
npm install
in result you should get node_modules folder created


LAUNCH INSTRUCTIONS:
*open terminal in folder containing "server.js" file (files folder)*
then run following command:
node server.js




TESTING INSTRUCTIONS:
you need to visit the website that is printed in console:
http://localhost:3000/chatClient.html
or simply http://localhost:3000/ (this is sane modification and not an error)

To terminate server press CNTL-C


Open this website in two(or more) browser windows, and you will be able to chat between clients(windows)

To view messages or send yourself you first need to register in chat
To do that you need to enter username in specified field and press "connect as" button
Valid username should not have special characters(and space) and should not start with number(though they are allowed)

After you press submit button, you will see greeting message as well as alert about successful login, 
while other users will see message that you have connected(see modification 2)

You can now enter message in the message box and press "send" to send it publicly

To send private message you need to write the following:
"Receiver1, Receiver2, ... Receiver: message to send privately"
This way all the receivers (one or many) and yourself will get the message, while others will not

NOTE that if server doesn't find any receivers with such name (i.e. you misspelled the username)
the message will be sent as public

In addition server can handle messages that contain colon symbols, and are not meant to be private (with error see below)
Examples:
if message is "Maksym: do this: thing1, thing2, thing3" 
	the user Maksym will receive "do this: thing1, thing2, thing3"
if message is "I told Maksym to do this: thing1, thing2, thing3"
	everyone will receive "I told Maksym to do this: thing1, thing2, thing3"
if message is "I told Maksym, Joe to do this: thing1, thing2, thing3"
	everyone will receive "I told Maksym, Joe to do this: thing1, thing2, thing3"
HOWEVER
if message is "I told Maksym, Joe, Emily to do this: thing1, thing2, thing3"
	JOE will receive "thing1, thing2, thing3"
	because server will treat Joe as sender as the name is between two commas

So be aware of such error, even though it is unlikely to happen accidentally


You can press "Clear chat" button to clear all messages from the chat (and history, see modification 4)


Color code for messages:
Black - regular public message
Blue - public message you sent
Red - private message
Orange - message about user connection
Yellow - message about user disconnection
Grey - message from chat history

*****************************************************************************************************************

The following are modifications I made, which I think go well with purpose and intent of this assignment:

*modification 1*
Private messages are now showing all recepients(still only existing) of the message
Messages now show like this: "Sender -> Recepient1, Recepient2, ... : message"
This is made so that all members of private group know who was sender and recepients
NOTE that this doesn't break security requirement as only intended recepients see the message and no one else

*modification 2*
Messages now appear indicating person connecting and disconnecting from the chat
only other people see them, while connecting user sees own greeting message, along with pop-up
This was made so that everyone knows who connects and disconnects from chat

*modification 3*
You can see how many clients are currently logged in to the chat as a counter
However user can still be logged, but afk.
This was made so when person logs in, they know how many people are currently there
("Hey is anyone there???" is now not needed)

*modification 4*
Chat history
When person logs in with same username as before, the chat history will appear in grey before other messages
It is set to 30 messages at most, but this is easily modifiable variable on server side
Chat history consists only of public messages, and no private messages will be added to that history
"Clear chat" button also clears the history for this user

NOTE that this does not break security requirements as no user will see the messages that were prior to the first login

Take a look at this example:

messages1
User Maksym connected to chat for the first time
messages2
User Maksym disconnected
messages3
User Maksym reconnected to chat
messages4
User Joe connected to chat for the first time

In the above example, Maksym will see public messages 2,3 and 4, but will never see messages1
While Joe will see clear chat, and never know what were the messages 1,2,3,4

This was made so person sees the last messages, which helps to read the conversation while they were away
