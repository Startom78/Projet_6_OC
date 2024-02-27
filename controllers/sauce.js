const sauceModel = require("../models/sauce")
const fs = require('fs')
const user = require("../models/user")

exports.allSauces = (req, res) => {
    //console.log('coucou')
    sauceModel.find().lean()
    .then(resultdata => {
        //console.log(resultdata)
        return res.status(200).json(resultdata.map(sauce => ({...sauce, imageUrl: `${req.protocol}://${req.get('host')}${sauce.imageUrl}`})))
        // return res.status(200).json(resultdata.map(sauce => {return {...sauce, imageUrl: `${req.protocol}://${req.get('host')}${sauce.imageUrl}`}}))
         })
    .catch (err => res.status(500).json({err}))
}



exports.theSauce = (req, res) => {
    sauceModel.findOne({ _id: req.params.id }).lean()
    .then(sauce =>  res.status(200).json({...sauce, imageUrl: `${req.protocol}://${req.get('host')}${sauce.imageUrl}`}))
    .catch(error => res.status(404).json({ error }));
}

exports.postSauce = (req, res, next) => {
    console.log('Ca va pour le moment')
    const sauce = JSON.parse(req.body.sauce)
    delete sauce._id;
    console.log(sauce)
    const theSauce = new sauceModel ({
        ...sauce,
        imageUrl: `/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    })
    theSauce.save()
    .then(()=> res.status(201).json({message: 'sauce enregistrée avec succes !'}))
    .catch(err => res.status(400).json({message: err}))
    

}

exports.modifySauce = (req, res) => {
    if (req.file) {
        sauceModel.findOne({ _id: req.params.id })
            .then(sauce => {
                const fileToModify = sauce.imageUrl.split('/images/')[1];
                console.log('file to modify :' + fileToModify)
                fs.unlink(`images/${fileToModify}`, (err) => {
                    if (err) {
                        console.log(err)
                    }
                    const modifiedSauce = { 
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `/images/${req.file.filename}`
                    }
                    console.log('ici ma sauce modifiée:', modifiedSauce)
                    sauceModel.updateOne({ _id: req.params.id }, modifiedSauce)
                        .then(() => res.status(200).json({ message: 'Sauce modifiée. And...voila !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
      
        const sauceSameFile = { ...req.body };
        console.log(req.body)
        sauceModel.updateOne({ _id: req.params.id }, sauceSameFile)
            .then(() => res.status(200).json({ message: 'Sauce modifiée. and...tadaaaaaam !' }))
            .catch(error => res.status(400).json({ error }));
    }
}

exports.deleteSauce = (req, res) => {
    sauceModel.findOne({ _id: req.params.id })
      .then(sauce => {
        const fileToDelete = sauce.imageUrl.split('images/')[1];
          fs.unlink(`images/${fileToDelete}`, (err) => {
            if (err) console.log(err)
            sauceModel.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée...bye bye la sauce !'}))
                .catch(error => res.status(400).json({ error }));
        })
      })
      .catch(error => res.status(500).json({ error }));
};

exports.likeOrDislikeSauce = (req, res) => {
    const like = req.body.like
    console.log('ceci est mon like:' + req.body.like)
    console.log(req.body)
    sauceModel.findOne({ _id: req.params.id }).lean()
      .then(sauce => {
        
        if (like > 0) {
            if (!sauce.usersLiked.includes(req.body.userId)) {
                sauce.usersLiked.push(req.body.userId)
                sauce.likes++
                sauceModel.updateOne({ _id: req.params.id }, sauce)
                    .then(() => res.status(200).json({ message: 'Sauce likée. Elle doit être vraiment bonne !'}))
                    .catch(error => res.status(400).json({ error }))
               
            }
   
        } 
        else 
            if (like < 0) {
                if (!sauce.usersDisliked.includes(req.body.userId))
                    sauce.usersDisliked.push(req.body.userId)
                    sauce.dislikes++
                    sauceModel.updateOne({ _id: req.params.id }, sauce)
                        .then(() => res.status(200).json({ message: 'Sauce dislikée. Elle doit être vraiment mauvaise...'}))
                        .catch(error => res.status(400).json({ error }))

                    } 
        else {
            if (sauce.usersLiked.includes(req.body.userId) && like == 0) { 
                sauce.usersLiked = sauce.usersLiked.filter(userId => userId !== req.body.userId)
                sauce.likes--
                sauceModel.updateOne({ _id: req.params.id }, sauce)
                .then(() => res.status(200).json({ message: 'Sauce délikée. Elle n"était pas si bonne que ca ?'}))
                .catch(error => res.status(400).json({ error }))}
             
            else if (sauce.usersDisliked.includes(req.body.userId) && like ==0) {
                sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId !== req.body.userId)
                sauce.dislikes--
                sauceModel.updateOne({ _id: req.params.id }, sauce)
                .then(() => res.status(200).json({ message: 'Sauce dédislikée. Donnez lui une seconde chance !'}))
                .catch(error => res.status(400).json({ error }))}
        } 
    })
}

