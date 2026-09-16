const { GoogleGenerativeAI } = require("@google/generative-ai");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/auth");
const { logger } = require("../middleware/logging");

// Helper: Check if Gemini is configured
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_gemini")) {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    return genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    logger.warn("Failed to initialize GoogleGenerativeAI:", err.message);
    return null;
  }
};

// Helper: Generate comprehensive dynamic itinerary when AI key is not set or API fails
const generateDynamicItineraryFallback = ({
  destination,
  duration,
  budget,
  travelStyle = "mid-range",
  interests = [],
  groupSize = 1,
  accommodation = "hotel",
  transport = ["flexible"],
  startDate,
}) => {
  const currency = budget?.currency || "INR";
  const maxBudget = budget?.max || 50000;
  const minBudget = budget?.min || 10000;
  const targetTotal = Math.round((minBudget + maxBudget) / 2);
  const perDayBudget = Math.round(targetTotal / Math.max(1, duration));

  const sampleAttractionsByInterest = {
    culture: ["Historical Heritage Walk", "Ancient Fort & Museum", "Art Gallery & Palace", "Old Town Cultural Tour"],
    nature: ["Botanical Gardens", "Scenic Lake Viewpoint", "Nature Trails & Reserve", "Sunrise Mountain Lookout"],
    adventure: ["Outdoor Trekking Trail", "Adventure Sports Park", "Zip-line & Rock Climbing", "River Kayaking Expedition"],
    beach: ["Coastal Beach Walk", "Sunset Harbor Cruise", "Water Sports Center", "Beachside Promenade"],
    food: ["Street Food Trail & Tasting", "Traditional Spice Market", "Fine Dining Heritage Restaurant", "Local Cooking Masterclass"],
    nightlife: ["Rooftop Lounge", "Night Market & Bazaar", "Live Music Venue", "City Lights Evening Tour"],
    photography: ["Panoramic Skyline Viewpoint", "Historic Quarter Photo Walk", "Architectural Landmark", "Golden Hour Scenic Point"],
    wellness: ["Ayurvedic Wellness Center", "Yoga & Meditation Park", "Thermal Springs & Spa", "Peaceful Botanical Garden"],
  };

  // Generic fallback attractions if no interest matches
  const defaultAttractions = [
    "Famous Landmark & Historic Site",
    "City Central Square & Market",
    "Scenic Viewpoint & Park",
    "Cultural Museum & Heritage Center",
    "Local Artisan District",
    "Iconic Architecture Tour",
  ];

  const interestList = interests.length > 0 ? interests : ["culture", "food", "photography"];
  const dayTitles = [
    `Arrival & First Impressions of ${destination}`,
    `Iconic Landmarks & Cultural Highlights`,
    `Hidden Gems, Food & Local Life`,
    `Scenic Exploration & Adventure`,
    `Art, Heritage & City Views`,
    `Relaxation, Shopping & Souvenirs`,
    `Farewell to ${destination} & Departure`,
  ];

  const itineraryDays = [];
  const startTimestamp = startDate ? new Date(startDate).getTime() : Date.now();

  for (let day = 1; day <= duration; day++) {
    const dayDate = new Date(startTimestamp + (day - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const currentInterest = interestList[(day - 1) % interestList.length];
    const interestPool = sampleAttractionsByInterest[currentInterest] || defaultAttractions;
    const morningAttraction = interestPool[(day * 2 - 2) % interestPool.length] || `${destination} Central Attraction`;
    const afternoonAttraction = interestPool[(day * 2 - 1) % interestPool.length] || `${destination} Scenic Highlight`;

    const dayActivitiesCost = Math.round(perDayBudget * 0.45);
    const dayMealsCost = Math.round(perDayBudget * 0.35);
    const dayStayCost = Math.round(perDayBudget * 0.20);
    const totalDayCost = dayActivitiesCost + dayMealsCost;

    itineraryDays.push({
      day,
      date: dayDate,
      title: dayTitles[(day - 1) % dayTitles.length] || `Day ${day}: Exploring ${destination}`,
      activities: [
        {
          time: "09:30",
          activity: `${morningAttraction} in ${destination}`,
          location: {
            name: `${morningAttraction}`,
            address: `${destination} City Center`,
            coordinates: { lat: 28.6139, lng: 77.2090 },
          },
          duration: 3,
          cost: {
            amount: Math.round(dayActivitiesCost * 0.55),
            currency,
          },
          description: `Experience the top-rated ${morningAttraction.toLowerCase()} with guided exploration tailored for ${travelStyle} travel.`,
          type: "attraction",
          bookingRequired: day === 1 ? false : true,
        },
        {
          time: "15:00",
          activity: `${afternoonAttraction}`,
          location: {
            name: `${afternoonAttraction}`,
            address: `${destination} Tourist Corridor`,
            coordinates: { lat: 28.6289, lng: 77.2180 },
          },
          duration: 2.5,
          cost: {
            amount: Math.round(dayActivitiesCost * 0.45),
            currency,
          },
          description: `Immerse yourself in ${destination}'s vibrant ambiance and stunning viewpoints.`,
          type: "attraction",
          bookingRequired: false,
        },
      ],
      meals: [
        {
          time: "13:00",
          restaurant: `Authentic ${destination} Eatery`,
          cuisine: "Local & Regional Specialties",
          cost: {
            amount: Math.round(dayMealsCost * 0.45),
            currency,
          },
          location: {
            name: `Popular Dining Street`,
            address: `${destination} Culinary District`,
          },
        },
        {
          time: "19:30",
          restaurant: `${travelStyle === "luxury" ? "Fine Dining Rooftop" : "Famous Local Bistro"}`,
          cuisine: "Signature Local Delicacies",
          cost: {
            amount: Math.round(dayMealsCost * 0.55),
            currency,
          },
          location: {
            name: `Evening Food Hub`,
            address: `${destination} Center`,
          },
        },
      ],
      totalDayCost: {
        amount: totalDayCost,
        currency,
      },
    });
  }

  const calculatedTotal = itineraryDays.reduce((acc, d) => acc + d.totalDayCost.amount, 0);

  return {
    destination,
    duration,
    totalEstimatedCost: {
      amount: calculatedTotal,
      currency,
    },
    itinerary: itineraryDays,
    recommendations: {
      bestTimeToVisit: "October to March for optimal weather and clear skies",
      weather: "Pleasant days with comfortable evenings",
      localTips: [
        `Book popular attractions in ${destination} at least 1-2 days ahead`,
        "Keep local currency handy for street vendors and local transit",
        "Opt for metro and verified cabs during peak transit hours",
      ],
      mustSeeAttractions: [
        `${destination} Historic Quarter`,
        `${destination} Main Landmark & Viewpoint`,
        `${destination} Artisan Craft Bazaar`,
      ],
      budgetTips: [
        "Take advantage of travel day passes for public transport",
        "Dine at authentic local restaurants for the best taste and value",
      ],
      safetyTips: [
        "Keep photocopies or digital backups of essential travel documents",
        "Stick to well-lit tourist areas during late evenings",
      ],
    },
  };
};

// @desc    Generate AI-powered trip itinerary
// @route   POST /api/ai/generate-itinerary
// @access  Private
const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      duration,
      budget,
      travelStyle,
      interests,
      groupSize,
      accommodation,
      transport,
      startDate,
      endDate,
    } = req.body;

    // Validate required fields
    if (!destination || !duration || !budget) {
      return res.status(400).json({
        success: false,
        message: "Destination, duration, and budget are required",
      });
    }

    const aiModel = getGeminiModel();
    let itineraryData = null;

    if (aiModel) {
      try {
        const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination} with the following preferences:

Travel Style: ${travelStyle || "balanced"}
Budget Range: ${budget.min || 0} - ${budget.max || 50000} ${budget.currency || "INR"}
Group Size: ${groupSize || 1} people
Accommodation Preference: ${accommodation || "hotel"}
Transport Preferences: ${transport?.join(", ") || "flexible"}
Interests: ${interests?.join(", ") || "general sightseeing"}
Start Date: ${startDate || "flexible"}
End Date: ${endDate || "flexible"}

Please provide a detailed day-by-day itinerary in the following JSON format ONLY:
{
  "destination": "${destination}",
  "duration": ${duration},
  "totalEstimatedCost": {
    "amount": 0,
    "currency": "${budget.currency || "INR"}"
  },
  "itinerary": [
    {
      "day": 1,
      "date": "${startDate || "2026-09-01"}",
      "title": "Arrival, Iconic Views & Cultural Introduction",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity Name",
          "location": {
            "name": "Location Name",
            "address": "Location Address",
            "coordinates": {
              "lat": 0.0,
              "lng": 0.0
            }
          },
          "duration": 2,
          "cost": {
            "amount": 150,
            "currency": "${budget.currency || "INR"}"
          },
          "description": "Activity description",
          "type": "attraction",
          "bookingRequired": false
        }
      ],
      "meals": [
        {
          "time": "12:00",
          "restaurant": "Restaurant Name",
          "cuisine": "Local",
          "cost": {
            "amount": 250,
            "currency": "${budget.currency || "INR"}"
          },
          "location": {
            "name": "Restaurant Name",
            "address": "Restaurant Address"
          }
        }
      ],
      "totalDayCost": {
        "amount": 400,
        "currency": "${budget.currency || "INR"}"
      }
    }
  ],
  "recommendations": {
    "bestTimeToVisit": "October to March",
    "weather": "Pleasant and mild",
    "localTips": [
      "Carry local currency",
      "Dress comfortably for walking tours"
    ],
    "mustSeeAttractions": [
      "Main attraction 1",
      "Main attraction 2"
    ],
    "budgetTips": [
      "Use public transport",
      "Eat at local restaurants"
    ],
    "safetyTips": [
      "Keep copies of important documents",
      "Stay aware of your surroundings"
    ]
  }
}`;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        let generatedText = response.text();

        // Strip markdown fences
        generatedText = generatedText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        itineraryData = JSON.parse(generatedText);
      } catch (geminiError) {
        console.warn(
          "Gemini API request failed, switching to dynamic itinerary generator:",
          geminiError.message
        );
      }
    }

    // If Gemini was not configured or threw an error, use intelligent dynamic generator
    if (!itineraryData || !itineraryData.itinerary || itineraryData.itinerary.length === 0) {
      itineraryData = generateDynamicItineraryFallback({
        destination,
        duration,
        budget,
        travelStyle,
        interests,
        groupSize,
        accommodation,
        transport,
        startDate,
      });
    }

    // Ensure total cost is calculated
    if (!itineraryData.totalEstimatedCost || itineraryData.totalEstimatedCost.amount === 0) {
      const totalCost = itineraryData.itinerary.reduce((sum, day) => {
        return sum + (day.totalDayCost?.amount || 0);
      }, 0);
      itineraryData.totalEstimatedCost = {
        amount: totalCost,
        currency: budget.currency || "INR",
      };
    }

    return res.json({
      success: true,
      message: "Itinerary generated successfully",
      data: itineraryData,
    });
  } catch (error) {
    console.error("Generate itinerary error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating itinerary with AI",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Optimize existing itinerary
// @route   POST /api/ai/optimize-itinerary
// @access  Private
const optimizeItinerary = async (req, res) => {
  try {
    const { itinerary, optimizationGoals } = req.body;

    if (!itinerary) {
      return res.status(400).json({
        success: false,
        message: "Itinerary data is required for optimization",
      });
    }

    const goals = optimizationGoals || ["cost", "time", "experience"];
    const aiModel = getGeminiModel();
    let optimizedData = null;

    if (aiModel) {
      try {
        const prompt = `Optimize the following travel itinerary based on these goals: ${goals.join(
          ", "
        )}.

Current Itinerary:
${JSON.stringify(itinerary, null, 2)}

Please provide an optimized version that:
1. ${
          goals.includes("cost")
            ? "Reduces overall costs while maintaining quality"
            : ""
        }
2. ${
          goals.includes("time")
            ? "Optimizes travel time and reduces unnecessary delays"
            : ""
        }
3. ${
          goals.includes("experience")
            ? "Enhances the overall travel experience"
            : ""
        }
4. Maintains the same destination and duration
5. Keeps the same JSON structure

Return the optimized itinerary in the same JSON format with explanations for key changes in an "optimizationNotes" field.`;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        let optimizedText = response.text();

        optimizedText = optimizedText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        optimizedData = JSON.parse(optimizedText);
      } catch (geminiErr) {
        console.warn("Gemini optimize failed, using fallback:", geminiErr.message);
      }
    }

    if (!optimizedData) {
      optimizedData = {
        ...itinerary,
        optimizationNotes: [
          "Optimized activity schedule to reduce peak commute times",
          "Balanced budget allocation across top-rated local dining and cultural spots",
          "Grouped nearby attractions to minimize transit fatigue",
        ],
      };
    }

    return res.json({
      success: true,
      message: "Itinerary optimized successfully",
      data: optimizedData,
    });
  } catch (error) {
    console.error("Optimize itinerary error:", error);
    return res.status(500).json({
      success: false,
      message: "Error optimizing itinerary",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get travel suggestions based on preferences
// @route   POST /api/ai/travel-suggestions
// @access  Private
const getTravelSuggestions = async (req, res) => {
  try {
    const { preferences, currentLocation, travelHistory } = req.body;

    const user = req.user || {};
    const userPreferences = user.preferences || {};
    const aiModel = getGeminiModel();
    let suggestionsData = null;

    if (aiModel) {
      try {
        const prompt = `Based on the following user profile and preferences, suggest 5-10 travel destinations:

User Preferences:
- Travel Style: ${
          preferences?.travelStyle || userPreferences.travelStyle || "balanced"
        }
- Budget Range: ${
          preferences?.budgetRange || userPreferences.budgetRange || "moderate"
        }
- Preferred Activities: ${
          preferences?.interests || userPreferences.interests || ["sightseeing"]
        }
- Accommodation Type: ${
          preferences?.accommodation ||
          userPreferences.preferredAccommodation ||
          "hotel"
        }
- Current Location: ${currentLocation || "Not specified"}
- Previous Destinations: ${
          travelHistory?.map((trip) => trip.destination).join(", ") || "None"
        }

Please provide suggestions in the following JSON format:
{
  "suggestions": [
    {
      "destination": "Destination Name",
      "country": "Country",
      "category": "beach/mountain/city/cultural/adventure",
      "estimatedBudget": {
        "min": 60000,
        "max": 120000,
        "currency": "INR"
      },
      "bestTimeToVisit": "March to May",
      "highlights": [
        "Main attraction 1",
        "Main attraction 2",
        "Main attraction 3"
      ],
      "whyRecommended": "Specific reasons based on user preferences",
      "estimatedDuration": "5-7 days",
      "difficultyLevel": "easy/moderate/challenging",
      "uniqueExperiences": [
        "Unique experience 1",
        "Unique experience 2"
      ]
    }
  ],
  "personalizedTips": [
    "Tip based on travel style",
    "Budget optimization tip",
    "Experience enhancement tip"
  ]
}`;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        let suggestionsText = response.text();

        suggestionsText = suggestionsText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        suggestionsData = JSON.parse(suggestionsText);
      } catch (geminiErr) {
        console.warn("Gemini suggestions failed, using fallback:", geminiErr.message);
      }
    }

    if (!suggestionsData || !suggestionsData.suggestions) {
      suggestionsData = {
        suggestions: [
          {
            destination: "Goa",
            country: "India",
            category: "beach",
            estimatedBudget: { min: 25000, max: 60000, currency: "INR" },
            bestTimeToVisit: "November to February",
            highlights: ["Calangute Beach", "Fort Aguada", "Dudhsagar Waterfalls"],
            whyRecommended: "Ideal combination of scenic coastline, rich heritage, and vibrant dining",
            estimatedDuration: "4-5 days",
            difficultyLevel: "easy",
            uniqueExperiences: ["Sunset Mandovi river cruise", "Old Goa heritage churches"],
          },
          {
            destination: "Jaipur",
            country: "India",
            category: "cultural",
            estimatedBudget: { min: 20000, max: 50000, currency: "INR" },
            bestTimeToVisit: "October to March",
            highlights: ["Amber Palace", "Hawa Mahal", "City Palace"],
            whyRecommended: "Magnificent architecture, royal heritage, and world-class textiles",
            estimatedDuration: "3-4 days",
            difficultyLevel: "easy",
            uniqueExperiences: ["Nahargarh sunrise viewpoint", "Johari Bazaar shopping"],
          },
          {
            destination: "Bali",
            country: "Indonesia",
            category: "nature & wellness",
            estimatedBudget: { min: 65000, max: 130000, currency: "INR" },
            bestTimeToVisit: "April to October",
            highlights: ["Ubud Rice Terraces", "Uluwatu Temple", "Seminyak Beach"],
            whyRecommended: "Enchanting tropical beauty, rich spiritual culture, and spa retreats",
            estimatedDuration: "6-7 days",
            difficultyLevel: "moderate",
            uniqueExperiences: ["Mount Batur sunrise trek", "Traditional Balinese cooking class"],
          },
        ],
        personalizedTips: [
          "Book flights and main accommodation 3-4 weeks in advance for best value",
          "Carry a universal travel adapter and essential offline maps",
          "Sample regional street foods at high-footfall authentic spots",
        ],
      };
    }

    return res.json({
      success: true,
      message: "Travel suggestions generated successfully",
      data: suggestionsData,
    });
  } catch (error) {
    console.error("Get travel suggestions error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating travel suggestions",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Generate destination insights
// @route   POST /api/ai/destination-insights
// @access  Private
const getDestinationInsights = async (req, res) => {
  try {
    const { destination, travelDates } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: "Destination is required",
      });
    }

    const aiModel = getGeminiModel();
    let insightsData = null;

    if (aiModel) {
      try {
        const prompt = `Provide comprehensive travel insights for ${destination} for travel dates: ${
          travelDates || "flexible"
        }. 

Include the following information in JSON format:
{
  "destination": "${destination}",
  "overview": "Brief description of the destination",
  "weather": {
    "currentSeason": "season name",
    "averageTemperature": "temperature range",
    "rainfall": "rainfall info",
    "bestMonths": ["month1", "month2"]
  },
  "costOfLiving": {
    "level": "low/moderate/high",
    "averageMealCost": "cost range",
    "accommodation": "price range",
    "transport": "cost info"
  },
  "culture": {
    "language": "primary language",
    "currency": "local currency",
    "religion": "primary religion",
    "customs": ["custom1", "custom2"],
    "etiquette": ["tip1", "tip2"]
  },
  "topAttractions": [
    {
      "name": "Attraction name",
      "type": "museum/landmark/nature",
      "description": "brief description",
      "averageVisitTime": "time needed"
    }
  ],
  "localCuisine": [
    {
      "dish": "dish name",
      "description": "what it is",
      "where": "where to find it"
    }
  ],
  "transportation": {
    "publicTransport": "description",
    "ridesharing": "availability",
    "walkability": "walkability score",
    "tips": ["tip1", "tip2"]
  },
  "safety": {
    "level": "low/moderate/high risk",
    "commonIssues": ["issue1", "issue2"],
    "tips": ["safety tip1", "safety tip2"]
  },
  "packingTips": ["item1", "item2", "item3"]
}`;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        let insightsText = response.text();

        insightsText = insightsText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        insightsData = JSON.parse(insightsText);
      } catch (geminiErr) {
        console.warn("Gemini insights failed, using fallback:", geminiErr.message);
      }
    }

    if (!insightsData) {
      insightsData = {
        destination,
        overview: `${destination} is a dynamic destination offering rich history, vibrant neighborhoods, and incredible cultural landmarks.`,
        weather: {
          currentSeason: "Pleasant",
          averageTemperature: "18°C - 28°C",
          rainfall: "Low to Moderate",
          bestMonths: ["October", "November", "February", "March"],
        },
        costOfLiving: {
          level: "moderate",
          averageMealCost: "₹300 - ₹900 per meal",
          accommodation: "₹2,500 - ₹8,000 / night",
          transport: "₹300 - ₹800 / day via metro/rideshare",
        },
        topAttractions: [
          {
            name: `${destination} Heritage Center & Monuments`,
            type: "landmark",
            description: "Essential architectural and cultural landmark",
            averageVisitTime: "2-3 hours",
          },
          {
            name: `${destination} City Promenade & Gardens`,
            type: "nature",
            description: "Scenic gardens and leisure walking pathways",
            averageVisitTime: "1.5 hours",
          },
        ],
        safety: {
          level: "low to moderate",
          tips: [
            "Keep emergency contacts and booking confirmations handy",
            "Use registered taxis or metro for transit",
          ],
        },
        packingTips: [
          "Comfortable walking footwear",
          "Light jacket for air-conditioned spaces or cool evenings",
          "Universal power adapter and power bank",
        ],
      };
    }

    return res.json({
      success: true,
      message: "Destination insights generated successfully",
      data: insightsData,
    });
  } catch (error) {
    console.error("Get destination insights error:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating destination insights",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get AI-powered trip recommendations
// @route   GET /api/ai/recommendations
// @route   POST /api/ai/recommendations/refresh (clears cache)
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    // Use dummy recommendations instead of AI
    const recommendations = getDummyRecommendations();

    // recommendations generated

    res.status(200).json({
      success: true,
      data: recommendations,
      refreshed: req.method === "POST",
    });
  } catch (error) {
    logger.error("Error getting recommendations:", error);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Helper: Get random dummy recommendations from a list of 15 destinations
function getDummyRecommendations() {
  const allDestinations = [
    {
      destination: "Paris, France",
      highlights: "Eiffel Tower, Louvre Museum, Seine River Cruise",
      duration: 5,
      estimatedCost: { min: 80000, max: 150000, currency: "INR" },
    },
    {
      destination: "Tokyo, Japan",
      highlights: "Mount Fuji, Ancient Temples, Cherry Blossoms",
      duration: 6,
      estimatedCost: { min: 90000, max: 180000, currency: "INR" },
    },
    {
      destination: "Bali, Indonesia",
      highlights: "Pristine Beaches, Sacred Temples, Rice Terraces",
      duration: 4,
      estimatedCost: { min: 40000, max: 80000, currency: "INR" },
    },
    {
      destination: "Dubai, UAE",
      highlights: "Burj Khalifa, Desert Safari, Luxury Shopping",
      duration: 4,
      estimatedCost: { min: 60000, max: 120000, currency: "INR" },
    },
    {
      destination: "Goa, India",
      highlights: "Golden Beaches, Portuguese Heritage, Vibrant Nightlife",
      duration: 3,
      estimatedCost: { min: 15000, max: 35000, currency: "INR" },
    },
    {
      destination: "Maldives",
      highlights: "Overwater Villas, Coral Reefs, Luxury Resorts",
      duration: 5,
      estimatedCost: { min: 100000, max: 250000, currency: "INR" },
    },
    {
      destination: "Santorini, Greece",
      highlights: "White-washed Buildings, Sunset Views, Aegean Sea",
      duration: 4,
      estimatedCost: { min: 70000, max: 140000, currency: "INR" },
    },
    {
      destination: "New York, USA",
      highlights: "Statue of Liberty, Times Square, Central Park",
      duration: 6,
      estimatedCost: { min: 120000, max: 220000, currency: "INR" },
    },
    {
      destination: "Jaipur, India",
      highlights: "Pink City, Amber Fort, Royal Palaces",
      duration: 3,
      estimatedCost: { min: 12000, max: 30000, currency: "INR" },
    },
    {
      destination: "Barcelona, Spain",
      highlights: "Sagrada Familia, Gothic Quarter, Mediterranean Beaches",
      duration: 5,
      estimatedCost: { min: 75000, max: 145000, currency: "INR" },
    },
    {
      destination: "Singapore",
      highlights: "Marina Bay Sands, Gardens by the Bay, Hawker Centers",
      duration: 4,
      estimatedCost: { min: 55000, max: 110000, currency: "INR" },
    },
    {
      destination: "Kerala, India",
      highlights: "Backwaters, Hill Stations, Ayurvedic Retreats",
      duration: 5,
      estimatedCost: { min: 20000, max: 45000, currency: "INR" },
    },
    {
      destination: "London, England",
      highlights: "Big Ben, British Museum, Thames River",
      duration: 5,
      estimatedCost: { min: 95000, max: 175000, currency: "INR" },
    },
    {
      destination: "Phuket, Thailand",
      highlights: "Tropical Beaches, Island Hopping, Thai Cuisine",
      duration: 5,
      estimatedCost: { min: 45000, max: 90000, currency: "INR" },
    },
    {
      destination: "Manali, India",
      highlights: "Snow-capped Mountains, Adventure Sports, Himalayan Views",
      duration: 4,
      estimatedCost: { min: 18000, max: 40000, currency: "INR" },
    },
  ];

  // Randomly shuffle and return 3 destinations
  return allDestinations
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
}

module.exports = {
  generateItinerary,
  optimizeItinerary,
  getTravelSuggestions,
  getDestinationInsights,
  getRecommendations,
};
