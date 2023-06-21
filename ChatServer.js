class ChatServer{
    constructor(games){
        this.games = games
    }

    broadcastMessage(socket,gameId,message){
        socket.broadcast.to(gameId).emit("receive-message", message)
      }
}

module.exports = ChatServer