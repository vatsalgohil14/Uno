const mongoose = require('mongoose')

const gameSchema = new mongoose.Schema({
    userId1:{
        type:String,
        required: true
    },
    jwt1:{
        type:String,
        required: true
    },
    userId2:{
        type:String,
        default: null
    },
    jwt2:{
        type:String,
        default: null
    }
})

module.exports = mongoose.model('Game', gameSchema);