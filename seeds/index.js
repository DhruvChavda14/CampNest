const mongoose = require('mongoose')
const cities = require('./cities.js')
const { places, descriptors } = require('./seedHelpers.js')
const Campground = require('../models/campground.js')
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})

    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '6721bf5ac943d0976d10724b',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dcfdglofy/image/upload/v1731131030/YelpCamp/kejwlxbweuvmj5siqglz.png',
                    filename: 'YelpCamp/kejwlxbweuvmj5siqglz',

                },
                {
                    url: 'https://res.cloudinary.com/dcfdglofy/image/upload/v1731131032/YelpCamp/n2jlngqy5ge4m2f9dqvr.png',
                    filename: 'YelpCamp/n2jlngqy5ge4m2f9dqvr',

                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})


