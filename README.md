
## Installation

```bash
$ npm install
```

## start redis
```bash
# to start the redis
$ docker-compose up
```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run the queries and mutuations 
```bash
# graphql api
# Navigate to localhost:7000/graphql and run the queries and mutuations.
# Only  publicRoute (Query), createUser (mutuation) and login (mutuation) are available to access without JWT authentication. 
# All other queries, mutuations require a JWT token in header (Authorization: Bearer {token} )
$ localhost:7000/graphql
```


## connect to Websocket 
```bash
# connect to the localhost:7000 via a socket.io client 
# add the JWT token in the header (Authorization: Bearer {token}
     ## Listen to the following events

      # event name: new-message to receive new messages
      $ listen event :  new-message
     
      # event name: notification to receive new notifications
      $ listen event :  notification

      # event name: error to receive errors
      $ listen event :  error


    ## To receive messages in real time, pass the group id (roomId) in JSON body of the event join-room

      # event name: join-room
      $ { roomId : "chat-room-id"}


     ## Send message to the group (chat-room) by passing the group id(roomId) and message in JSON body of the event send-group-msg

      # event name: join-room
      $ { roomId : "chat-room-id", message :"Your message"}

```
