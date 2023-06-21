const mongoose = require('mongoose')

require('dotenv').config()

const DB_URL = process.env.DB_URL
mongoose.connect(DB_URL, {useNewUrlParser: true})
mongoose.connection.on('connected', ()=>{
    // console.log('Database Connected')
})

