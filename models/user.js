const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});
// this will add unique username and passport fields in our schema
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User",userSchema)