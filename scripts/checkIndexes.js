const mongoose = require('mongoose');

async function checkIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/travels');
    console.log('Connected to database');
    
    // Define Wishlist schema directly
    const wishlistSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay' },
      tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
      adventureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Adventure' },
      vehicleRentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleRental' },
    }, { timestamps: true });
    
    const Wishlist = mongoose.model('Wishlist', wishlistSchema);
    
    // Get existing indexes
    const indexes = await Wishlist.collection.indexes();
    console.log('Existing indexes:');
    for (const index of indexes) {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.partialFilterExpression) {
        console.log(`  Partial filter: ${JSON.stringify(index.partialFilterExpression)}`);
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkIndexes();