const sauceModel = require("../models/sauce")

const userpermission = (req,res,next) => {
    sauceModel.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.userId === sauce.userId) {
                next()
            }
            else {
                return res.status(401).json(" Vous n'avez pas l'autorisation de faire cela")
            }
        })
        .catch(err => res.status(404).json("La sauce n'existe pas"))
}



module.exports = userpermission
