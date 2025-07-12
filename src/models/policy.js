const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Policy must have a name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Policy description is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    }
}, {
    timestamps: true
});

const Policy = mongoose.model('Policy', policySchema);

module.exports = Policy;
