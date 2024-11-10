const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync.js')
const multer = require('multer')
const { isLoggedIn, validateCampground,isAuthor } = require('../middleware.js')
const { index, renderNewForm, createCampground, showCampground, updateCampground, deleteCampground, editCampground } = require('../controllers/campground.js')
const {storage} = require('../cloudinary/index.js')
const upload = multer({storage})


router.route('/')
    .get(catchAsync(index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(createCampground))

router.get('/new',isLoggedIn, renderNewForm)

router.route('/:id')
    .get(catchAsync(showCampground))
    .put(isLoggedIn, isAuthor,upload.array('image') , validateCampground, catchAsync(updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync(deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(editCampground))

module.exports = router