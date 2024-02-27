const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const userpermission = require('../middleware/userpermission')
const multer = require('../middleware/multer-config')
const sauceCtrl = require("../controllers/sauce")


router.get('/', auth, sauceCtrl.allSauces);
router.get('/:id', auth, sauceCtrl.theSauce);
router.post('/', auth, multer, sauceCtrl.postSauce);
router.put('/:id', auth, userpermission, multer, sauceCtrl.modifySauce)
router.delete('/:id', auth, userpermission, sauceCtrl.deleteSauce)
router.post('/:id/like', auth, sauceCtrl.likeOrDislikeSauce)

module.exports = router;