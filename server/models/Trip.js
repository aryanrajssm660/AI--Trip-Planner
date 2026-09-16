const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Trip title is required"],
      trim: true,
    },
    description: String,

    // Trip details
    destination: {
      city: {
        type: String,
        required: true,
        default: "Destination",
      },
      country: {
        type: String,
        default: "Worldwide",
      },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },

    // Trip preferences
    preferences: {
      budget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: {
          type: String,
          default: "INR",
        },
      },
      duration: {
        type: Number, // in days
        default: 1,
      },
      travelStyle: {
        type: String,
        default: "mid-range",
      },
      groupSize: {
        type: Number,
        default: 1,
      },
      interests: [{ type: String }],
      accommodation: {
        type: String,
        default: "hotel",
      },
      transport: [{ type: String }],
    },

    // AI-generated itinerary
    itinerary: {
      generatedBy: {
        type: String,
        default: "AI",
      },
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      days: [
        {
          day: Number,
          date: Date,
          title: String, // AI-generated title for the day
          theme: String, // Theme/description of the day
          activities: [
            {
              time: String,
              activity: String,
              location: {
                name: String,
                address: String,
                coordinates: {
                  lat: Number,
                  lng: Number,
                },
              },
              duration: Number, // in hours
              cost: {
                amount: Number,
                currency: String,
              },
              description: String,
              type: {
                type: String,
                default: "activity",
              },
              bookingRequired: {
                type: Boolean,
                default: false,
              },
            },
          ],
          totalCost: {
            amount: Number,
            currency: String,
          },
        },
      ],
      totalCost: {
        amount: Number,
        currency: String,
      },
      summary: String,
    },



    // Trip status
    status: {
      type: String,
      enum: ["draft", "upcoming", "ongoing", "completed", "cancelled"],
      default: "draft",
    },

    // Trip dates
    startDate: Date,
    endDate: Date,

    // Additional information
    notes: String,
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],

    // AI suggestions and recommendations
    recommendations: {
      weather: {
        forecast: String,
        bestTime: String,
      },
      localTips: [String],
      mustSee: [String],
      budgetTips: [String],
      safetyTips: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ status: 1 });
tripSchema.index({ "destination.city": 1, "destination.country": 1 });
tripSchema.index({ startDate: 1, endDate: 1 });

// Virtual for trip duration
tripSchema.virtual("tripDuration").get(function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return this.preferences.duration;
});

// Virtual for days until trip
tripSchema.virtual("daysUntilTrip").get(function () {
  if (this.startDate) {
    const now = new Date();
    const diffTime = this.startDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to calculate total cost
tripSchema.methods.calculateTotalCost = function () {
  if (this.itinerary.days && this.itinerary.days.length > 0) {
    const total = this.itinerary.days.reduce((sum, day) => {
      return sum + (day.totalCost?.amount || 0);
    }, 0);
    this.itinerary.totalCost = {
      amount: total,
      currency: this.preferences.budget.currency || "USD",
    };
  }
  return this.save();
};



// Method to update trip status
tripSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;

  // Auto-update status based on dates
  if (newStatus === "upcoming" && this.startDate) {
    const now = new Date();
    if (now >= this.startDate && now <= this.endDate) {
      this.status = "ongoing";
    } else if (now > this.endDate) {
      this.status = "completed";
    }
  }

  return this.save();
};

// Pre-save middleware to calculate total cost
tripSchema.pre("save", function (next) {
  if (this.isModified("itinerary.days")) {
    this.calculateTotalCost();
  }
  next();
});

module.exports = mongoose.model("Trip", tripSchema);
