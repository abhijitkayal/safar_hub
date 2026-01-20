import mongoose from "mongoose";

let indexesReady = false;

type IndexDef = {
  name: string;
  spec: mongoose.mongo.IndexSpecification;
  options: mongoose.mongo.CreateIndexesOptions;
};

const INDEX_DEFS: IndexDef[] = [
  {
    name: "user_stay_unique",
    spec: { userId: 1, stayId: 1 } satisfies mongoose.mongo.IndexSpecification,
    options: {
      unique: true,
      partialFilterExpression: { stayId: { $exists: true } },
    },
  },
  {
    name: "user_tour_unique",
    spec: { userId: 1, tourId: 1 } satisfies mongoose.mongo.IndexSpecification,
    options: {
      unique: true,
      partialFilterExpression: { tourId: { $exists: true } },
    },
  },
  {
    name: "user_adventure_unique",
    spec: { userId: 1, adventureId: 1 } satisfies mongoose.mongo.IndexSpecification,
    options: {
      unique: true,
      partialFilterExpression: { adventureId: { $exists: true } },
    },
  },
  {
    name: "user_vehicle_unique",
    spec: { userId: 1, vehicleRentalId: 1 } satisfies mongoose.mongo.IndexSpecification,
    options: {
      unique: true,
      partialFilterExpression: { vehicleRentalId: { $exists: true } },
    },
  },
];

export async function ensureWishlistIndexes() {
  if (indexesReady) return;

  const connection = mongoose.connection;
  if (connection.readyState !== 1) {
    // Not connected yet; caller should have awaited dbConnect.
    return;
  }

  const collection = connection.collection("wishlists");
  const existingIndexes = await collection.indexes();

  for (const { name, spec, options } of INDEX_DEFS) {
    const existing = existingIndexes.find((idx) => idx.name === name);

    const needsReset =
      !existing ||
      JSON.stringify(existing.key) !== JSON.stringify(spec) ||
      JSON.stringify(existing.partialFilterExpression || null) !==
        JSON.stringify(options.partialFilterExpression || null) ||
      existing.unique !== options.unique;

    if (needsReset) {
      if (existing) {
        try {
          await collection.dropIndex(name);
        } catch (err) {
          // Ignore drop errors (index might not exist anymore)
        }
      }
      const createOptions: mongoose.mongo.CreateIndexesOptions = { ...options, name };
      await collection.createIndex(spec, createOptions);
    }
  }

  indexesReady = true;
}

