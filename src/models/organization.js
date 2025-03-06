const mongoose = require('mongoose')

const organizationSchema = new mongoose.Schema(
	{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
		name: {
			type: String,
			trim: true,
			required: true,
			minLength: 2,
			maxLength: 99,
		},
		bio: {
      type: String,
      trim: true,
    },
		website: {
      type: String,
      trim: true,
    },
		contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
		address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
		profileImage: {
			type: String,
		},
		verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        documentType: {
          type: String,
          enum: ['license', 'certificate', 'nid', "others"],
          required: true,
        },
        documentUrl: {
          type: String, // URL to the uploaded document
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
		verificationNotes: {
      type: String, // Notes from admin during verification
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }  }
);

organizationSchema.virtual('tours', {
  ref: 'Tour',
  localField: '_id',
  foreignField: 'createdBy',
});


// Method to hide unnecessary fields to 'user' role 
organizationSchema.methods.toJSON = function () {
	const org = this.toObject();

	delete org.verificationStatus;
	delete org.verificationDocuments;
	delete org.verificationNotes;
	delete org.isActive;
	delete org.__v;

	return org;
};

organizationSchema.pre('save', function (next) {
  if (!this.profilePicture) {
    this.profilePicture = 'default.jpg';
  }
  next();
});
// ==============================================

const Organization = mongoose.model('Organization', organizationSchema)
module.exports = Organization;