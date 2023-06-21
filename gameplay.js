const games = new Map();
const shuffledCards = require("./lib/utils").shuffledCards;
const shuffledCardsMiddle = require("./lib/utils").shuffledCardsMiddle
const startGame = (io, gameId, userId1, userId2) => {
  const newMapUser1 = new Map();
  const user1Cards = shuffledCards().splice(0, 7);
  for (i = 0; i < 7; i++) {
    if (newMapUser1.has(user1Cards[i])) {
      newMapUser1.set(user1Cards[i], newMapUser1.get(user1Cards[i]) + 1);
    } else {
      newMapUser1.set(user1Cards[i], 1);
    }
  }
  const newMapUser2 = new Map();
  const user2Cards = shuffledCards().splice(0, 7);
  for (i = 0; i < 7; i++) {
    if (newMapUser2.has(user2Cards[i])) {
      newMapUser2.set(user2Cards[i], newMapUser2.get(user2Cards[i]) + 1);
    } else {
      newMapUser2.set(user2Cards[i], 1);
    }
  }
  const middleCard = shuffledCardsMiddle().splice(0, 1);
  const newGameObject = new Object();
  newGameObject["middle"] = middleCard[0];
  newGameObject[userId1] = Object.fromEntries(newMapUser1);
  newGameObject[userId2] = Object.fromEntries(newMapUser2);

  const noOfCards = new Object()
  noOfCards[userId1] = 7
  noOfCards[userId2] = 7

  newGameObject["noOfCards"] = noOfCards
  console.log(newGameObject);

  newGameObject["turn"] = userId1
  games.set(gameId, newGameObject);
  io.to(gameId).emit("game-start", {
    gameObject: newGameObject,
    gameId: gameId,
  });
};

const playCard = (io, gameId, cardPlayedObj, userId, nextTurn)=>{
  const cardPlayed = cardPlayedObj.cardPlayed
  const gameObject = games.get(gameId)
  console.log(gameObject[userId])
  const userCards = new Map(Object.entries(gameObject[userId]))
  if(userCards.get(cardPlayed)-1 == 0){
    userCards.delete(cardPlayed)
  }
  else{
    userCards.set(cardPlayed, userCards.get(cardPlayed)-1)
  }
  gameObject[userId] = Object.fromEntries(userCards)
  gameObject["middle"]=cardPlayed;
  gameObject.noOfCards[nextTurn]-=1;
  if(cardPlayed.startsWith('skip') || cardPlayed.startsWith('_') || cardPlayed.startsWith('D')){
    gameObject.turn = userId
  }
  else{
    gameObject.turn = nextTurn
  }
  if(cardPlayed.startsWith('D4')){
    const userCards2 = new Map(Object.entries(gameObject[nextTurn]))
    const newCards = shuffledCards().splice(0,4);
    for (i = 0; i < 4; i++) {
      if (userCards2.has(newCards[i])) {
        userCards2.set(newCards[i], userCards2.get(newCards[i]) + 1);
      } else {
        userCards2.set(newCards[i], 1);
      }
  }
    gameObject[nextTurn] = Object.fromEntries(userCards2)
    gameObject.noOfCards[userId] += 4
  }

  if(cardPlayed.startsWith('D2')){
    const userCards2 = new Map(Object.entries(gameObject[nextTurn]))
    const newCards = shuffledCards().splice(0,2);
    for (i = 0; i < 2; i++) {
      if (userCards2.has(newCards[i])) {
        userCards2.set(newCards[i], userCards2.get(newCards[i]) + 1);
      } else {
        userCards2.set(newCards[i], 1);
      }
  }
    gameObject[nextTurn] = Object.fromEntries(userCards2)
    gameObject.noOfCards[userId] += 2
  }

  games.set(gameId, gameObject)
  console.log(gameObject["middle"]);

  if(gameObject.noOfCards[nextTurn] == 0){
    io.to(gameId).emit("update-state", {
      gameObject: gameObject,
      winner: userId
    })
  }
  else if(cardPlayed.startsWith('W')){
    io.to(gameId).emit("update-state", {
      gameObject: gameObject,
      newColor: cardPlayedObj.newColor
    })
  }
  else{
    io.to(gameId).emit("update-state", {
      gameObject: gameObject,
    })
  }
}

const drawCard = (io, gameId, userId1, userId2)=>{
  const gameObject = games.get(gameId)
  const userCards = new Map(Object.entries(gameObject[userId1]))
  const newCard = shuffledCards().splice(0, 1);
  if(userCards.has(newCard)){
    userCards.set(newCard, userCards.get(newCard) + 1);
  }else{
    userCards.set(newCard, 1);
  }
  gameObject[userId1] = Object.fromEntries(userCards)
  gameObject.noOfCards[userId2]+=1
  gameObject.turn = userId1
  games.set(gameId,gameObject)
  io.to(gameId).emit("update-state", {
    gameObject: gameObject,
  })
}

const pass = (io,gameId,userId1,userId2)=>{
  const gameObject = games.get(gameId)
  gameObject.turn = userId2
  games.set(gameId,gameObject)
  io.to(gameId).emit("update-state", {
    gameObject: gameObject,
  })
}

const sendMessage = (socket,gameId,message)=>{
  socket.broadcast.to(gameId).emit("receive-message", message)
}

const uno = (socket, gameId)=>{
  socket.broadcast.to(gameId).emit("uno-called")
}

const notUno = (io,gameId,userId1, userId2)=>{
  const gameObject = games.get(gameId)
  const userCards = new Map(Object.entries(gameObject[userId1]))
  const newCards = shuffledCards().splice(0,4);
  for(i=0; i<4; i++){
    if(userCards.has(newCards[i])){
      userCards.set(newCards[i], userCards.get(newCards[i]) + 1);
    }else{
      userCards.set(newCards[i], 1);
    }
  }
  gameObject[userId1] = Object.fromEntries(userCards)
  gameObject.noOfCards[userId2]+=4
  games.set(gameId,gameObject)
  io.to(gameId).emit("update-state", {
    gameObject: gameObject,
  })
}


module.exports.startGame = startGame;
module.exports.playCard = playCard;
module.exports.drawCard = drawCard;
module.exports.pass = pass;
module.exports.sendMessage = sendMessage;
module.exports.uno = uno;
module.exports.notUno = notUno;
