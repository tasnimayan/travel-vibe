const Review = require('../../models/review');
const User = require('../../models/user');
const mongoose = require('mongoose')


exports.createReview = async (req, res) =>{
	try {
		const tourId = new mongoose.Types.ObjectId(req.params.tourId);

		// Simple check to see if req.user has booked this tour
		const user = await User.findOne({$and:[{_id:req.user._id}, {userTours:{$in:[tourId]}}]})
		
		if (!user.userTours.includes(tourId)) {
			return res.status(401).send();
		}
		
		const userId = new mongoose.Types.ObjectId(user._id)
		// Create review
		const review = await Review.create({
			review: req.body.review,
			rating: req.body.rating,
			tour:tourId,
			user: userId,
		});

		if (!review) {
			return res.status(400).send();
		}

		res.status(201).send(review.toJSON());
	} catch (err) {
		res.status(400).send(err);
	}
}

exports.getAllReviews = async function(req, res) {
	try {
			
		const tourId = new mongoose.Types.ObjectId(req.params.tourId)
		const reviews = await Review.find({tour:tourId});

		if (!reviews) {
			return res.status(404).send();
		}

		res.status(200).send({reviews});
	} catch (err) {
		res.status(400).send(err);
	}
}

// exports.getOneReview = async function(req, res) {
// 	try {
// 		const id = new mongoose.Types.ObjectId(req.params.revId);
// 		const review = await Review.findById(id);

// 		if (!review) {
// 			return res.status(404).send();
// 		}

// 		res.status(200).send(review);
// 	} catch (err) {
// 		res.status(400).send(err);
// 	}
// }

exports.updateReview = async function(req, res) {
	try {
		const reqObj = Object.keys(req.body);
		const allowedUpdates = ['review', 'rating'];
		const validUpdates = {};

		// filtering updates
		reqObj.forEach(el => {
			if (allowedUpdates.includes(el))
				validUpdates[el] = req.body[el];
			return validUpdates;
		});
		console.log(validUpdates);

		const id = new mongoose.Types.ObjectId(req.params.revId);
		// review query and update
		const review = await Review.findByIdAndUpdate(
			id,
			validUpdates,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!review) {
			return res.status(404).send();
		}

		res.status(200).send({ message: 'Updates successfull!', review });
	} catch (err) {
		res.status(400).send(err);
	}
}

exports.deleteReview = async (req, res) => {
	try {
		const review = await Review.findOneAndDelete({
			_id: req.params.revId,
			user: req.user,
		});

		if (!review) {
			return res.status(404).send();
		}

		res.status(204).send();
	} catch (err) {
		res.status(400).send(err);
	}
}
