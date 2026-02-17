import { Router } from 'express';
import { uploadImage } from './image.controller';
import { upload } from '../../middleware/upload.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { allowRoles } from '../../middleware/role.middleware';

const router = Router();

router.post(
  '/upload',
  upload.single("image"),
    (req, res, next) => {
      console.log(req.file);
    res.json({ file: req.file });
    console.log('ROUTE HIT');
    next();
  },
  // authMiddleware,
  // allowRoles(['ADMIN', 'AUTHOR']),
  uploadImage
);

export default router;
