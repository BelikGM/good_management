import { Module } from '@nestjs/common';
import { FileUploadController } from '../../controllers/file-upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileModule } from './file.module';
import { AttachmentModule } from './attachment.module';
import { v4 as uuidv4 } from 'uuid';
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOADS_PATH,
        filename: (req, file, cb) => {
          const mime = file.mimetype.split('/')[0];
          let filename: string;
          const currentDate = new Date();
          const formattedDate = formatDate(currentDate);
          const lastDotIndex = file.originalname.lastIndexOf('.');
          const fileType = file.originalname.slice(lastDotIndex + 1);
          const uniqueId = uuidv4();
          switch (mime) {
            case 'image':
              filename = `photo_${formattedDate}_${uniqueId}.${fileType}`;
              cb(null, filename);
              break;
            case 'application':
              filename = `doc_${formattedDate}_${uniqueId}.${fileType}`;
              cb(null, filename);
              break;
            case 'video':
              filename = `video_${formattedDate}_${uniqueId}.${fileType}`;
              cb(null, filename);
              break;
            case 'text':
              filename = `text_${formattedDate}_${uniqueId}.${fileType}`;
              cb(null, filename);
              break;
          }
        },
      }),
    }),
    FileModule,
    AttachmentModule,
  ],
  controllers: [FileUploadController],
})
export class FileUploadModule {}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0'); // День (DD)
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяц (MM)
  const year = date.getFullYear(); // Год (YYYY)

  const hours = String(date.getHours()).padStart(2, '0'); // Часы (HH)
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Минуты (MM)
  const seconds = String(date.getSeconds()).padStart(2, '0'); // Секунды (SS)

  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
}
