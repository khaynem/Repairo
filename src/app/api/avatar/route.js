import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression('resource_type:image')
      .max_results(100)
      .execute();

    console.log(`Found ${result.resources?.length || 0} images in Cloudinary`);

    if (result && result.resources && result.resources.length > 0) {
      const randomIndex = Math.floor(Math.random() * result.resources.length);
      const randomImage = result.resources[randomIndex];

      console.log(`Selected random image: ${randomImage.public_id}`);

      const avatarUrl = cloudinary.url(randomImage.public_id, {
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        secure: true,
      });

      return NextResponse.json({ 
        avatarUrl,
        source: 'cloudinary',
        public_id: randomImage.public_id
      });
    }

    console.log('No images found in Cloudinary account');
    const randomColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const fallbackUrl = `https://ui-avatars.com/api/?name=User&size=200&background=${randomColor}&color=fff`;
    
    return NextResponse.json({ 
      avatarUrl: fallbackUrl,
      message: "No images in Cloudinary, using fallback avatar service"
    });

  } catch (error) {
    console.error("Error fetching random avatar from Cloudinary:", error);
    
    const randomColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    const fallbackUrl = `https://ui-avatars.com/api/?name=User&size=200&background=${randomColor}&color=fff`;
    
    return NextResponse.json({ 
      avatarUrl: fallbackUrl,
      message: "Error accessing Cloudinary, using fallback avatar service",
      error: error.message
    });
  }
}
