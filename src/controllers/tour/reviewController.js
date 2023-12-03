const Review = require('../../models/review');
const User = require('../../models/user');
const mongoose = require('mongoose')


exports.createReview = async (req, res) =>{
	try {
		const tour = req.body.tour ? req.body.tour : req.params.id;
		const user = req.body.user ? req.body.user : req.user;

		// Simple check to see if req.user has booked this tour
		if (!req.user.userTours.includes(tour)) {
			return res.status(401).send();
		}

		// Create review
		const review = await Review.create({
			review: req.body.review,
			rating: req.body.rating,
			tour:tour,
			user:user,
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
		let filter = {};

		if (req.params.id) {
			filter = { tour: req.params.id };
		}
		const reviews = await Review.find(filter);

		if (!reviews) {
			return res.status(404).send();
		}

		res.status(200).send({reviews});
	} catch (err) {
		res.status(400).send(err);
	}
}

exports.getOneReview = async function(req, res) {
	try {
		const id = new mongoose.Types.ObjectId(req.params.revId);
		const review = await Review.findById(id);

		if (!review) {
			return res.status(404).send();
		}

		res.status(200).send(review);
	} catch (err) {
		res.status(400).send(err);
	}
}

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
