class Game {
    constructor(games, packOfCards, packMiddle){
        this.games = games
        this.packOfCards = packOfCards
        this.packMiddle = packMiddle
    }

    shuffledCards(){ 
        var array = this.packOfCards
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1))
            var temp = array[i]
            array[i] = array[j]
            array[j] = temp;
        }   
        return array;
    }

    shuffledCardsMiddle(){
        var array = this.packMiddle
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1))
            var temp = array[i]
            array[i] = array[j]
            array[j] = temp;
        }   
        return array;
    }

    startGame(io, gameId, userId1, userId2){
        const newMapUser1 = new Map();
        const user1Cards = ["1Y","5R","D4W","W","3R","9G","0B"];
        for (var i = 0; i < 7; i++) {
          if (newMapUser1.has(user1Cards[i])) {
            newMapUser1.set(user1Cards[i], newMapUser1.get(user1Cards[i]) + 1);
          } else {
            newMapUser1.set(user1Cards[i], 1);
          }
        }
        const newMapUser2 = new Map();
        const user2Cards = ["8Y","3R","D4W","W","7R","4G","5B"];
        for (var i = 0; i < 7; i++) {
          if (newMapUser2.has(user2Cards[i])) {
            newMapUser2.set(user2Cards[i], newMapUser2.get(user2Cards[i]) + 1);
          } else {
            newMapUser2.set(user2Cards[i], 1);
          }
        }
        const middleCard = this.shuffledCardsMiddle().splice(0, 1);
        const newGameObject = new Object();
        newGameObject["middle"] = middleCard[0];
        newGameObject[userId1] = Object.fromEntries(newMapUser1);
        newGameObject[userId2] = Object.fromEntries(newMapUser2);
      
        const noOfCards = new Object()
        noOfCards[userId1] = 7
        noOfCards[userId2] = 7
      
        newGameObject["noOfCards"] = noOfCards
        // console.log(newGameObject);
      
        newGameObject["turn"] = userId1
        this.games.set(gameId, newGameObject);
        io.to(gameId).emit("game-start", {
          gameObject: newGameObject,
          gameId: gameId,
        });
      };

      playCard(io, gameId, cardPlayedObj, userId, nextTurn){
        const cardPlayed = cardPlayedObj.cardPlayed
        const gameObject = this.games.get(gameId)
        // console.log(gameObject[userId])
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
          const newCards = this.shuffledCards().splice(0,4);
          for (var i = 0; i < 4; i++) {
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
          const newCards = this.shuffledCards().splice(0,2);
          for (var i = 0; i < 2; i++) {
            if (userCards2.has(newCards[i])) {
              userCards2.set(newCards[i], userCards2.get(newCards[i]) + 1);
            } else {
              userCards2.set(newCards[i], 1);
            }
        }
          gameObject[nextTurn] = Object.fromEntries(userCards2)
          gameObject.noOfCards[userId] += 2
        }
      
        this.games.set(gameId, gameObject)
        // console.log(gameObject["middle"]);
      
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

      drawCard(io, gameId, userId1, userId2){
        const gameObject = this.games.get(gameId)
        const userCards = new Map(Object.entries(gameObject[userId1]))
        const newCard = this.shuffledCards().splice(0, 1);
        if(userCards.has(newCard)){
          userCards.set(newCard, userCards.get(newCard) + 1);
        }else{
          userCards.set(newCard, 1);
        }
        gameObject[userId1] = Object.fromEntries(userCards)
        gameObject.noOfCards[userId2]+=1
        gameObject.turn = userId1
        this.games.set(gameId,gameObject)
        io.to(gameId).emit("update-state", {
          gameObject: gameObject,
        })
      }
      
      pass(io,gameId,userId1,userId2){
        const gameObject = this.games.get(gameId)
        gameObject.turn = userId2
        this.games.set(gameId,gameObject)
        io.to(gameId).emit("update-state", {
          gameObject: gameObject,
        })
      }
      
      callUno(socket, gameId){
        socket.broadcast.to(gameId).emit("uno-called")
      }
      
      notUno(io,gameId,userId1, userId2){
        const gameObject = this.games.get(gameId)
        const userCards = new Map(Object.entries(gameObject[userId1]))
        const newCards = this.shuffledCards().splice(0,4);
        for(var i=0; i<4; i++){
          if(userCards.has(newCards[i])){
            userCards.set(newCards[i], userCards.get(newCards[i]) + 1);
          }else{
            userCards.set(newCards[i], 1);
          }
        }
        gameObject[userId1] = Object.fromEntries(userCards)
        gameObject.noOfCards[userId2]+=4
        this.games.set(gameId,gameObject)
        io.to(gameId).emit("update-state", {
          gameObject: gameObject,
        })
      }

      
}

module.exports = Game