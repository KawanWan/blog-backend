import multer from 'multer'

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },  // agora até 20 MB
}).single('avatar')