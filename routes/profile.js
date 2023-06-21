const User = require('../models/user')
const router = require('express').Router()
const upload = require('../config/multer')
const path = require('path')
const passport = require('passport')
router.use(passport.authenticate('jwt', {session: false}))

router.put('/dp', upload.single('testImage'), async(req,res)=>{
    const user = req.user
    user.displayPicture = "/profile_pictures/"+req.file.filename
    try{
        user.save()
        .then((user)=>{
            res.json({success:true, msg: "Profile picture changed"})
        })
    }
    catch(err){
        res.json({success: false, msg: err})
    }
})
router.get('/user', (req,res)=>{
    res.json(req.user)
})
module.exports = router