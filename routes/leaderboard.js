const router = require('express').Router()
const User = require('../models/user')
const passport = require('passport')
const jwt = require('jsonwebtoken')
router.use(passport.authenticate('jwt', {session: false}))

router.get('/', (req,res)=>{
    const sortedUsers = User.find({}, null, {sort:{wins:-1}}, (err,users)=>{
        res.send(users)
    })
})

module.exports=router