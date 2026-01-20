// import mongoose from "mongoose";
// import User from "@/models/User";
// import Adventure from "@/models/Adventure";
// import Blog from "@/models/Blog";
// import Booking from "@/models/Booking";
// import CartItem from "@/models/CartItem";
// import Category from "@/models/Category";
// import Contact from "@/models/Contact";
// import Coupon from "@/models/Coupon";
// import HeroSection from "@/models/HeroSection";
// import Invoice from "@/models/Invoice";
// import Order from "@/models/Order";
// import Product from "@/models/Product";
// import Review from "@/models/Review";
// import Stay from "@/models/Stay";
// import Support from "@/models/Support";
// import Tour from "@/models/Tour";
// import VehicleRental from "@/models/VehicleRental";
// import Profile from "@/models/Profile";
// import UserAddress from "@/models/UserAddress";
// import OTP from "@/models/OTP";
// import Transaction from "@/models/Transaction";
// import Settlement from "@/models/Settlement";
// import AdminMeta from "@/models/AdminMeta";

// /**
//  * Initialize all collections in MongoDB
//  * This ensures collections are created even if they're empty
//  */
// export async function initializeCollections() {
//   try {
//     const collections = await mongoose.connection.db?.listCollections().toArray();
//     const collectionNames = collections?.map(c => c.name) || [];
    
//     console.log("📦 Existing collections:", collectionNames);
    
//     // Create collections if they don't exist by ensuring indexes
//     const models = [
//       User,
//       Adventure,
//       Blog,
//       Booking,
//       CartItem,
//       Category,
//       Contact,
//       Coupon,
//       HeroSection,
//       Invoice,
//       Order,
//       Product,
//       Review,
//       Stay,
//       Support,
//       Tour,
//       VehicleRental,
//       Profile,
//       UserAddress,
//       OTP,
//       Transaction,
//       Settlement,
//       AdminMeta,
//     ];

//     let createdCount = 0;
//     for (const model of models) {
//       const collectionName = model.collection.name;
//       if (!collectionNames.includes(collectionName)) {
//         await model.init(); // This creates the collection with indexes
//         console.log(`✅ Created collection: ${collectionName}`);
//         createdCount++;
//       }
//     }
    
//     if (createdCount > 0) {
//       console.log(`✅ ${createdCount} new collections initialized`);
//     } else {
//       console.log("✅ All collections already exist");
//     }
//   } catch (error) {
//     console.error("❌ Error initializing collections:", error);
//   }
// }
