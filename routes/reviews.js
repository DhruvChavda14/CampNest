const express = require('express')
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync.js')
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware.js')
const { createReview, deleteReview } = require('../controllers/reviews.js')


router.post('/', isLoggedIn, validateReview, catchAsync(createReview))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(deleteReview))

module.exports = router