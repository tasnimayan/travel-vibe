const TopDestination = require('../../models/topDestination')

// Get Top location based on search (complete)
exports.getTopDestination = async function(req, res) {
	try {
			// Get all locations from database 
		const destinations = await TopDestination.getDestinations();

		if (!destinations) {
			return res.status(404).send({message:"No category found"});
		}

		res.status(200).send({message:"success", data:destinations});
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}

// Update existing category details
exports.increaseDestinationWeight = async function(req, res) {
	try {
		// increase locations count on database
		const destinations = await TopDestination.increaseWeight(req.params.destinationId)

		if (!destinations) {
			return res.status(404).send({message:"Could not updated count!"});
		}

		res.status(200).send({ message: 'Updates successful!', data:destinations });
	} catch (err) {
		res.status(400).send({message:err.message});
	}
}
