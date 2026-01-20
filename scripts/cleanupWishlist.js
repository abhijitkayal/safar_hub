const mongoose = require('mongoose');

async function cleanupWishlist() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travels';
    await mongoose.connect(mongoUri);
    console.log('Connected to database:', mongoUri);
    
    // Define Wishlist schema directly
    const wishlistSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      stayId: { type: mongoose.Schema.Types.ObjectId, ref: "Stay" },
      tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
      adventureId: { type: mongoose.Schema.Types.ObjectId, ref: "Adventure" },
      vehicleRentalId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleRental" },
    }, { timestamps: true });
    
    // Create model
    const Wishlist = mongoose.model('Wishlist', wishlistSchema);
    
    // Find all wishlist entries
    const entries = await Wishlist.find({});
    console.log('Total wishlist entries:', entries.length);
    
    // Group by userId and service fields
    const grouped = {};
    entries.forEach(entry => {
      const serviceId = entry.stayId || entry.tourId || entry.adventureId || entry.vehicleRentalId;
      if (!serviceId) {
        console.log('Found entry with no service ID:', entry._id);
        return;
      }
      
      const key = `${entry.userId}-${serviceId}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    });
    
    // Find duplicates
    const duplicates = Object.values(grouped).filter(group => group.length > 1);
    console.log('Duplicate groups found:', duplicates.length);
    
    // Remove duplicates (keep first, delete rest)
    let deleted = 0;
    for (const group of duplicates) {
      // Sort by createdAt to keep the oldest
      group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      // Delete all but the first
      for (let i = 1; i < group.length; i++) {
        await Wishlist.findByIdAndDelete(group[i]._id);
        console.log('Deleted duplicate:', group[i]._id);
        deleted++;
      }
    }
    
    console.log('Deleted duplicate entries:', deleted);
    console.log('Cleanup complete');
    
    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupWishlist();