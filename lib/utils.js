const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const packMiddle = require('./packMiddle')
const packOfCards = require('./packOfCards')

require('dotenv').config()
const createSalt = async ()=>{
    const salt = await bcrypt.genSalt(10)
    return salt
}
const createPassword = async(password, salt)=>{
    const hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}
const validPassword = async(password, toCheck)=>{
    const isValid = bcrypt.compare(toCheck, password)
    return isValid
}
const issueJWT= (user)=>{
    const _id = user._id
    const expiresIn = '1D'
    const payload = {
        sub: _id,
        iat: Date.now()
    }
    const signedToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: expiresIn})
    return {
        token:"Bearer "+signedToken,
        expires: expiresIn
    }
}

const shuffledCards = ()=>{ 
    var array = packOfCards
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp;
    }   
    return array;
}

const shuffledCardsMiddle = ()=>{
    var array = packMiddle
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp;
    }   
    return array;
}
module.exports.createPassword = createPassword
module.exports.createSalt = createSalt
module.exports.validPassword = validPassword
module.exports.issueJWT = issueJWT
module.exports.shuffledCards = shuffledCards
module.exports.shuffledCardsMiddle = shuffledCardsMiddle