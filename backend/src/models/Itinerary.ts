import { Schema, model } from "mongoose";

const activitySchema = new Schema(
  { time: String, title: String, description: String, estimatedCost: Number, estimatedTravelTime: String, durationMinutes: Number, placeId: String, verified: { type: Boolean, default: false } },
  { _id: false }
);

const routeSchema = new Schema(
  { distanceKm: Number, durationMin: Number, source: { type: String, enum: ["osrm", "straight-line"] }, coordinates: { type: [[Number]], default: undefined } },
  { _id: false }
);

// Verified place data (OpenStreetMap / Wikipedia). Stored once per itinerary; days reference it by placeId.
const attractionSchema = new Schema(
  {
    id: String, name: String, category: String, description: String, address: String, lat: Number, lon: Number, openingHours: String, fee: String,
    website: String, sourceUrl: String, wikipediaUrl: String, verification: { type: String, enum: ["osm", "osm+wikipedia"] }, verifiedAt: Date,
  },
  { _id: false }
);

const dailyPlanSchema = new Schema(
  {
    day: Number,
    title: String,
    morning: [activitySchema],
    afternoon: [activitySchema],
    evening: [activitySchema],
    places: [String],
    placeIds: { type: [String], default: [] },
    food: [String],
    transport: String,
    estimatedDailyCost: Number,
    route: { type: routeSchema, default: undefined },
  },
  { _id: false }
);

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startingLocation: { type: String, default: "" },
    duration: { type: Number, required: true, min: 1, max: 30 },
    travelDates: { start: Date, end: Date },
    travellers: { adults: { type: Number, default: 1 }, children: { type: Number, default: 0 } },
    budget: { type: Number, default: 0 },
    travelStyle: { type: String, default: "" },
    transportation: { type: String, default: "" },
    accommodation: { type: String, default: "" },
    interests: { type: [String], default: [] },
    dietary: { type: String, default: "" },
    specialRequirements: { type: String, default: "" },
    overview: String,
    destinationSummary: String,
    dailyPlans: [dailyPlanSchema],
    bestApproach: String,
    importantInfo: [String],
    accommodationSuggestions: [String],
    accommodationPlaces: [new Schema({ name: String, address: String, lat: Number, lon: Number, sourceUrl: String }, { _id: false })],
    foodRecommendations: [new Schema({ dish: String, note: String, place: String, sourceUrl: String }, { _id: false })],
    estimatedTotalBudget: Number,
    budgetBreakdown: {
      type: new Schema({ accommodation: Number, food: Number, localTransport: Number, intercityTransport: Number, tickets: Number, activities: Number, miscellaneous: Number }, { _id: false }),
      default: undefined,
    },
    tips: [String],
    safety: [String],
    attractions: [attractionSchema],
    sources: [new Schema({ title: String, url: String, kind: String }, { _id: false })],
    warnings: [String],
    dataQuality: { type: String, enum: ["good", "limited", "none"] },
    verifiedAt: Date,
    dataProviders: [String],
    groundedNotes: [String],
    aiGenerated: { type: Boolean, default: true },
    aiModel: String,
    disclaimer: {
      type: String,
      default: "Places and coordinates come from OpenStreetMap/Wikipedia. Prices, opening hours and travel times are estimates - verify before booking.",
    },
    shareToken: { type: String, index: true, sparse: true },
    isShared: { type: Boolean, default: false },
    status: { type: String, enum: ["DRAFT", "SAVED", "COMPLETED"], default: "SAVED", index: true },
  },
  { timestamps: true }
);

export const Itinerary = model("Itinerary", schema);
