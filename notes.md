file uploading 

use signed urls from the server and from the client make the uploading. use superbase to handle that
// add file uploads using mullet 
and express. superbase

sockets
implement using subscriptions in graphql
// create one for messaging and chat rooms and other for notifications like likes and comments
real time updates, add amount of users live and maybe live chat function

the backend is venerable to csrf. cors site, see how to implement protection with express middle ware
implement rate limiting for uploading

import error-handling 

check n + 1 problem 

setup tables for friends and requested adds, notifications, messages, chats, profile, 

AUTH/ Check if the username already exists in the Database and if the Github or other usernames also collides with first

(how would chat work? how are they created or how they are used, are there two per each user, there should be a way to save them between two users or lock for them)
-----------------------------------
-[x]clear up Database stuff. and separate the schemes into a folder
-[x]clear up graphql mutations, messages, posts, friends and requested, notifications, resolves etc. no sockets, write 
the queries for the basic stuff for now 
-[x] add queries, and resolve's for quires for notifications 
-[x] fix finding a user resolver
-[x] implement rate limiting 
-[x] clear up the sup models, for messaging first, then comments, then others.
-[x] sockets for messaging and notifications
-[x] set up production environment. redirect Urls, etc
-[] set up a docker container and a production environment with .env and everything
-[] set up Github actions and run tests and lints on every push and merge 
-[-] setup sending a photo with messaging and pictures|| to be done on the Frontend
=
