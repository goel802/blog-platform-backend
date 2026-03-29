import { Response } from 'express';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';

// POST /api/images/upload
export const uploadImage = async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required' });
    const result = await uploadToCloudinary(req.file.buffer, 'general');
    return res.status(201).json({ message: 'Image uploaded successfully', imageUrl: result });
  } catch (error) {
    console.error('IMAGE UPLOAD ERROR:', error);
    return res.status(500).json({ message: 'Image upload failed' });
  }
};