import { Request, Response } from 'express';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';

export const uploadImage = async (req: any, res: Response) => {
  try {
    console.log("REQ.FILE =>", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

