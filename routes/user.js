const router = require('express').Router();
const User = require('../models/user')
const passport = require('passport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const LoginClass = require("../login")
const Login = new LoginClass(jwt, bcrypt)

router.get('/protected', passport.authenticate('jwt', {session: false}), (req,res)=>{
    res.json({success: true, msg: "You are a verified user"})
})

router.post('/login', (req,res)=>{
    console.log(req.body.inputs)
    User.findOne({userName: req.body.inputs.email.value})
    .then((user)=>{
        if(!user){
            res.json({success: false, msg: "User Not Registered"})
        }
        else{
            const hash = user.password
            Login.checkPassword(hash, req.body.inputs.password.value)
            .then((isValid)=>{
                if(isValid){
                    if(user.isVerified){
                        const newToken = Login.issueJWT(user)
                        res.json({success: true, token: newToken.token, expiresIn: newToken.expires})
                    }
                    else{
                        res.json({success: false, msg:"User Not Verified"})
                    }
                }
                else{
                    res.json({success: false, msg: "Incorrect Password"})
                }
            })
        }
    })
})

router.post('/register', (req, res, next)=>{
    console.log(req.body.inputs)
    User.findOne({userName: req.body.inputs.email.value})
    .then((user)=>{
        if(user){
            res.json({success: false, msg: "User already registered"})
        }
        else{
            Login.createSalt()
            .then((salt)=>{
                Login.createPassword(req.body.inputs.password.value, salt)
                .then((hashedPassword)=>{
                    const newUser = new User({
                        name: req.body.inputs.name.value,
                        userName: req.body.inputs.email.value,
                        password: hashedPassword,
                        country: req.body.inputs.country.value,
                        isVerified:true
                    })
                    try{
                        newUser.save()
                        .then((user)=>{
                            // Login.sendVerificationMail(user.userName, nodemailer)
                            res.json({success:true, msg: "user Saved"})
                        })
                    }
                    catch(err){
                        res.json({success: false, msg: err})
                    }
                })
            })
        }
    })
})

router.get('/verify/:confirmationCode', (req,res)=>{
    console.log("Hello")
    const decodedToken = jwt.decode(req.params.confirmationCode, {complete: true})
    const userName = decodedToken.payload.sub
    User.findOne({userName: userName})
    .then((user)=>{
        if(!user){
            res.json({success: false, msg:"User not found"})
        }
        user.isVerified = true;
        user.save((err)=>{
            if(err){
                res.json({success: false, msg: err})
            }
        })
        res.json({success: true})
    })
})

module.exports = router