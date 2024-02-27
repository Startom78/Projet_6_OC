const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        const value = req.headers.authorization
        //console.log('token :', value)
        const splited = value.split('Bearer ')
        if (splited.length<2) {
            return res.status(403).json({ message: "no bearer !"})
        }
        const token = splited[1]
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        //console.log("token", token, decoded.userId)
        req.token = token
        req.userId = decoded.userId
        return next()
    }
    //console.log('pas de token trouvé')
    return res.status(403).json({ message: "You should not pass !"})
}


module.exports = auth;