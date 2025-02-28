const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined. Please check your environment variables.");
    process.exit(1);
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Database Connected Successfully"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Exit the app if DB connection fails
    });

module.exports = mongoose;
