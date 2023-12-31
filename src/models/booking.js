const mongoose = require('mongoose');
const Tour = require('../models/tour');
const User = require('../models/user');

const bookingSchema = new mongoose.Schema(
	{
		tour: {
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A Booking must be made on a Tour'],
		},

		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'A Booking must belong to a User'],
		},

		price: {
			type: Number,
			required: [true, 'A Booking must have a price'],
		},

		paid: {
			type: Boolean,
			default: true,
		},
    emergencyContact:{
      name:{type:String},
      phone:{type:String}
    }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

bookingSchema.pre(/^find/, function (next) {
	this.populate('user').populate({ path: 'tour', select: 'name' });
	next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
