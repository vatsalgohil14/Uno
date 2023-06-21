const Game = require("../models/game");
const GameClass = require("../game")
const ChatServerClass = require("../ChatServer")
const packMiddle = require("../lib/packMiddle")
const packOfCards = require('../lib/packOfCards')
const games  = new Map()
const gameplay = new GameClass(games, packOfCards, packMiddle)
const ChatServer = new ChatServerClass(games)
const JWT = require("jsonwebtoken");
// const gameplay = require('../gameplay');

module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("socket connected");

    socket.on("create-game", (jwt) => {
      const decodedJwt = JWT.decode(jwt);
      const userId = decodedJwt.sub;
      const newGame = new Game({
        userId1: userId,
        jwt1: jwt
      });
      try {
        newGame.save().then((game) => {
          // console.log("New Game Created")
          socket.emit("gameId", game._id);
          // console.log(game._id.toString())
          socket.join(game._id.toString());
        });
      } catch (err) {
        // console.log(err);
      }
    });

    socket.on("join-game", (res) => {
      const jwt=res.jwt;
      const gameId=res.gameId;
      const decodedJwt = JWT.decode(jwt);
      const userId = decodedJwt.sub;
      Game.findById(gameId).then((game) => {
        if (!game) {
          socket.emit("error", {msg:"Incorrect ID"})
        } 
        else if (game.userId2 != null) {
          socket.emit("error", {msg:"Game Full"})
        } 
        else {
          game.userId2 = userId;
          game.jwt2 = jwt
          try {
            game.save().then((game) => {
              // console.log(gameId)
              socket.join(gameId);
              // socket.emit("join-successful",gameId)
              gameplay.startGame(io, gameId, game.jwt1, game.jwt2)
            });
          } catch (err) {
            socket.emit("error", {msg:err})
          }
        }
      })
      .catch((err)=>{
        socket.emit("error", {msg:"Incorrect Game ID"})
      });
    });

    socket.on("card-played", (res)=>{
      const gameId = res.gameId
      const cardPlayedObj = res.cardPlayedObj
      const jwt = res.jwt
      // console.log(res)
      Game.findById(gameId).then((game)=>{
        let nextTurn = null
        if(game.jwt1 == jwt){
          nextTurn = game.jwt2
        }
        else{
          nextTurn = game.jwt1
        }
        gameplay.playCard(io,gameId,cardPlayedObj, jwt, nextTurn)
      })
    })

    socket.on("draw", (res)=>{
      const gameId = res.gameId
      const jwt = res.jwt
      Game.findById(gameId).then((game)=>{
        let jwt2 = null
        if(game.jwt1 == jwt){
          jwt2 = game.jwt2
        }
        else{
          jwt2 = game.jwt1
        }
        gameplay.drawCard(io,gameId,jwt,jwt2)
      })
    })

    socket.on("pass", (res)=>{
      const gameId = res.gameId
      const jwt = res.jwt
      Game.findById(gameId).then((game)=>{
        let jwt2 = null
        if(game.jwt1 == jwt){
          jwt2 = game.jwt2
        }
        else{
          jwt2 = game.jwt1
        }
        gameplay.pass(io,gameId,jwt,jwt2)
      })
    })

    socket.on("uno", (res)=>{
      const gameId = res.gameId
      gameplay.callUno(socket,gameId)
    })

    socket.on("not-uno", (res)=>{
      const jwt = res.jwt
      const gameId = res.gameId
      Game.findById(gameId).then((game)=>{
        let jwt2 = null
        if(game.jwt1 == jwt){
          jwt2 = game.jwt2
        }
        else{
          jwt2 = game.jwt1
        }
        gameplay.notUno(io,gameId,jwt,jwt2)
      })
    })

    socket.on("send-message", (res)=>{
      const message = res.message
      const gameId = res.gameId
      ChatServer.broadcastMessage(socket, gameId, message)
    })
  });
};
