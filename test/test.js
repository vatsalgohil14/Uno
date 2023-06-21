var chai = require('chai');
var expect = chai.expect
var io = require("socket.io-client")
var mocha = require('mocha')
var chaiHttp = require('chai-http');
var server = require('../app');
var socketUrl = "http://localhost:3001";
var options = {  
  transports: ['websocket'],
  'force new connection': true
};
chai.should();
chai.use(chaiHttp);
const jwt1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzQ3MjU4ZTAyYTlkNWM4NDE1MWQ1OWEiLCJpYXQiOjE2Njc5OTAxMzAwMDMsImV4cCI6MTY2Nzk5MDIxNjQwM30.q1wH6P7Av1lM_yFAC95I6EspJ_y0IYD8YjN6c0bX_Sk"
const jwt2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzQ1YWEzNWM1ZjljYjc3ZGQyMTk0MzAiLCJpYXQiOjE2Njc5OTAyMTQyODMsImV4cCI6MTY2Nzk5MDMwMDY4M30.b7naxawGoXA4UIYvGKT7IhwGNlyHiD7j5ytsETqfvYM"

describe("Sockets", ()=>{
    describe("Test 1: Starting a game", ()=>{
        it("Should create and join a game with correct game Id", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId,
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                    })
                    client1.on('game-start', (res)=>{
                        expect(res).to.not.be.undefined
                        done();
                    })
                })
            })
        })
    })

    describe("Test 2: Incorrect game Id managed", ()=>{
        it("Should create and join a game", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId+"abc",
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                        client2.on("error", (res)=>{
                            expect(res.msg).to.equal("Incorrect Game ID")
                            done()
                        })
                    })
                })
            })
        })
    })

    describe("Test 3: Chat App", ()=>{
        it("Should be able to send and recieve a message", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId,
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                    })
                    client1.on('game-start', (res)=>{
                        client1.emit('send-message', {
                            message: "TEST",
                            gameId: res.gameId
                        })
                        client2.on('receive-message', (message)=>{
                            expect(message).to.equal("TEST")
                            done();
                        })
                    })
                })
            })
        })
    })

    describe("Test 4: Play a card", ()=>{
        it("The card played by one user should be updated to another user", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId,
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                    })
                    client1.on('game-start', (res)=>{
                        client1.emit('card-played', {
                            gameId: res.gameId,
                            jwt: jwt1,
                            cardPlayedObj: {
                                cardPlayed: "0B"
                            }
                        })
                        client2.on('update-state', (res)=>{
                            expect(res.gameObject.middle).to.equal("0B")
                            done();
                        })
                    })
                })
            })
        })
    })

    describe("Test 5: Draw a Card", ()=>{
        it("1 card should be added to the user ", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId,
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                    })
                    client1.on('game-start', (res)=>{
                        client1.emit('draw', {
                            gameId: res.gameId,
                            jwt: jwt1,
                        })
                        client2.on('update-state', (resNew)=>{
                            expect(resNew.gameObject.noOfCards[jwt2]).to.equal(res.gameObject.noOfCards[jwt2]+1)
                            done();
                        })
                    })
                })
            })
        })
    })

    describe("Test 6: Draw 4 Play", ()=>{
        it("4 cards to should be added to other user when draw 4 is played", (done)=>{
            client1 = io.connect(socketUrl, options)
            client1.on('connect', ()=>{
                client1.emit('create-game', jwt1)
                client1.on('gameId', (gameId)=>{
                    client2 = io.connect(socketUrl, options)
                    client2.on('connect', ()=>{
                        const obj = {
                            gameId: gameId,
                            jwt: jwt2
                        }
                        client2.emit('join-game', obj)
                    })
                    client1.on('game-start', (res)=>{
                        client1.emit('card-played', {
                            gameId: res.gameId,
                            jwt: jwt1,
                            cardPlayedObj: {
                                cardPlayed: "D4W"
                            }
                        })
                        client2.on('update-state', (resNew)=>{
                            expect(resNew.gameObject.noOfCards[jwt1]).to.equal(res.gameObject.noOfCards[jwt1]+4)
                            done();
                        })
                    })
                })
            })
        })
    })
})