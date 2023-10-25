const mongoose = require('mongoose')


const tourBookingSchema = mongoose.Schema({
  firstName:{type:String},
  lastName:{type:String},
  email:{type:String},
  phone:{type:String},
  address:{type:String},
  dob:{type:Date},
  emergencyContact:{name:"", phone:""}
});