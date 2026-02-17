import cloudinary from '../config/cloudinary';

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = 'image'
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [
            { width: 1200, crop: 'limit' }, // resize 
            { quality: 'auto', fetch_format: 'auto' }, // compress
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
             resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      )
      .end(buffer);
  });
};
