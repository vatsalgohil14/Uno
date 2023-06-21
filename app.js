const express = require('express')
const passport = require('passport')
const cors = require('cors')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer, {cors:{origin: true}})
const dotenv = require('dotenv')
dotenv.config();
const port = process.env.PORT

require('./config/socket')(io)
require('./config/database')
require('./config/passport')(passport)

app.use(cors())
app.use(passport.initialize())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname+'/public'))
app.use('/user', require('./routes/user'))
app.use('/profile',require('./routes/profile'))
app.use('/leaderboard',require('./routes/leaderboard'))
app.get('/protected', passport.authenticate('jwt', {session:false}),(req,res)=>{
    res.json({success: true})
})
// app.listen(port, ()=>{
//     console.log('Server listening on port '+port)
// })
httpServer.listen(port, ()=>{
    console.log('Server listening on port '+port)
})

module.exports = httpServer