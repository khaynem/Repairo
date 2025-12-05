const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  phone: String,
  skills: [String],
  certifications: String,
  bio: String,
  avatarUrl: String,
  createdAt: Date,
}, { 
  timestamps: true,
  collection: 'users'
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function getRandomAvatar() {
  try {
    const result = await cloudinary.search
      .expression('resource_type:image')
      .max_results(100)
      .execute();

    if (result && result.resources && result.resources.length > 0) {
      const randomIndex = Math.floor(Math.random() * result.resources.length);
      const randomImage = result.resources[randomIndex];

      return cloudinary.url(randomImage.public_id, {
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true,
      });
    }

    const randomColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    return `https://ui-avatars.com/api/?name=User&size=200&background=${randomColor}&color=fff`;
  } catch (error) {
    console.error('Error getting avatar:', error);
    return `https://ui-avatars.com/api/?name=User&size=200&background=random`;
  }
}

async function migrateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const usersWithoutAvatar = await User.find({ 
      $or: [
        { avatarUrl: { $exists: false } },
        { avatarUrl: null },
        { avatarUrl: '' }
      ]
    });

    console.log(`Found ${usersWithoutAvatar.length} users without avatars\n`);

    for (const user of usersWithoutAvatar) {
      const avatarUrl = await getRandomAvatar();
      user.avatarUrl = avatarUrl;
      await user.save();
      console.log(`✓ Assigned avatar to ${user.username} (${user.email})`);
      console.log(`  Avatar: ${avatarUrl}\n`);
    }

    console.log('Migration completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateUsers();
