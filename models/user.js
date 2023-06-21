const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    userName:{
        type: String, 
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    password:{
        type: String,
        required: true
    },
    country:{
        type: String,
    },
    noOfGames:{
        type: Number,
        default: 0
    },
    wins:{
        type: Number,
        default: 0
    },
    displayPicture:{
        type:String
    }
})

module.exports = mongoose.model('User', userSchema);