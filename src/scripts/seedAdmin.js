require('dotenv').config();
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const email = 'admin@akaraaka.app';  // change to your email
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Admin already exists:', email);
    } else {
      const admin = await User.create({
        name: 'Akaraaka Admin',
        email,
        password: 'ChangeThisPassword123!',
        role: 'admin'
      });
      console.log('Admin created:', admin.email);
    }
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();