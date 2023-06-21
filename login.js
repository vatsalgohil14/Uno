class Login{

    constructor(jwt, bcrypt){
        this.jwt = jwt
        this.bcrypt = bcrypt
    }

    issueJWT(user){
        const _id = user._id
        const expiresIn = '1D'
        const payload = {
            sub: _id,
            iat: Date.now()
        }
        const signedToken = this.jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: expiresIn})
        return {
            token:"Bearer "+signedToken,
            expires: expiresIn
        }
    }

    checkPassword(password, toCheck){
        const isValid = this.bcrypt.compare(toCheck, password)
        return isValid
    }

    async createSalt(){
        const salt = await this.bcrypt.genSalt(10)
        return salt
    }

    async createPassword(password, salt){
        const hashedPassword = await this.bcrypt.hash(password,salt)
        return hashedPassword
    }

    issueJWTVerification(email){
        const expiresIn = '1D'
        const payload = {
            sub: email,
            iat: Date.now()
        }
        const signedToken = this.jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: expiresIn})
        return {
            token:signedToken,
            expires: expiresIn
        }
    }
    // sendVerificationMail(email, nodemailer){
    //     const transport = nodemailer.createTransport({
    //       host: 'gmail',
    //       auth: {
    //         user: "vatsalgohil2002@gmail.com",
    //         pass: "ppeluscatygwinzo",
    //       },
    //     });
    //     const confirmationCode = this.issueJWTVerification(email).token
    //     transport.sendMail({
    //       from: "vatsalgohil2002@gmail.com",
    //       to: email,
    //       subject: "Please Verify Your Email",
    //       html: `<h1>Email Confirmation</h1>
    //         <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
    //         <a href=http://localhost:3001/user/verify/${confirmationCode}> Click here</a>
    //         </div>`,
    //     });
    // }
}

module.exports = Login