const Campground = require("../models/campground");
const { cloudinary } = require('../cloudinary/index')
const maptilerClient = require('@maptiler/client')
maptilerClient.config.apiKey = process.env.MAPTILER_KEY

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1})
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);

    res.send("OK");
};


module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')

    if (!campground) {
        req.flash('error', 'OOPPS!! Campground was not found!!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'OOPPS!! Campground was not found!!')
        return res.redirect('/campgrounds')
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit/delete!!!')
        return res.redirect(`/campgrounds/${id}`)
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit/delete!!!');
        return res.redirect(`/campgrounds/${id}`);
    }

    // Update campground details
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true }); // return updated document
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    camp.geometry = geoData.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.image.push(...imgs); // add new images
    await camp.save(); // save updated campground

    // Handle deleting images
    if (req.body.deleteImages) {
        // Delete images from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // Remove from campground images
        await Campground.updateOne(
            { _id: id },
            { $pull: { image: { filename: { $in: req.body.deleteImages } } } }
        );
    }

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${camp._id}`);
}


module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Deleted campground')
    res.redirect('/campgrounds')
}