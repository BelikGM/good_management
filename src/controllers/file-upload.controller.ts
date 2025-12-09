import {
  Controller,
  Post, Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/application/services/file/file.service';
import { FileCreateDto } from 'src/contracts/file/create-file.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { ImageValidationPipe } from 'src/validators/pipes/imageValidationPipe';
import { AttachmentService } from 'src/application/services/attachment/attachment.service';
import { AttachmentCreateDto } from 'src/contracts/attachment/create-attachment.dto';
import { Attachment } from 'src/domains/attachment.entity';
import { FileValidationPipe } from 'src/validators/pipes/fileValidationPipe';
import * as fs from 'fs';
import * as path from 'path';
import { File } from 'src/domains/file.entity';
@ApiTags('File')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('file-upload')
export class FileUploadController {
  constructor(
    private readonly fileService: FileService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить картинку в политику' })
  @ApiConsumes('multipart/form-data') // Указываем тип контента
  @ApiBody({
    description: 'Загрузка картинки',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: {},
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async uploadImageInPolicy(
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ): Promise<{ message: string; filePath: string }> {
    const fileCreateDto: FileCreateDto = {
      fileName: image.filename,
      path: image.path.slice(1),
      size: image.size,
      mimetype: image.mimetype,
    };
    const createdFile = await this.fileService.create(fileCreateDto);
    return { message: 'Файл успешно загружен!', filePath: createdFile.path };
  }

  @Post('uploadFile')
  @UseInterceptors(FilesInterceptor('files', 10)) // 'files' — имя поля формы
  @ApiOperation({
    summary: 'Загрузка файлов и определение хеша для их кеширования',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Загрузка файла',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
  })
  async uploadFiles(
    @UploadedFiles(new FileValidationPipe()) files: Array<Express.Multer.File>,
  ): Promise<Attachment[]> {
    console.log(files);
    const createdAttachments = await Promise.all(
      files.map(async (file) => {
        const fileHash = await this.attachmentService.calculateFileHash(
          file.path,
        );

        const attachmentCreateDto: AttachmentCreateDto = {
          attachmentName: file.filename,
          attachmentPath: file.path.slice(1),
          attachmentSize: file.size,
          attachmentMimetype: file.mimetype,
          originalName: file.originalname,
          hash: fileHash,
          target: null,
          message: null,
        };

        const createdAttachment =
          await this.attachmentService.create(attachmentCreateDto);

        console.log('File Hash:', fileHash);
        return createdAttachment;
      }),
    );
    return createdAttachments;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление файла или вложения по ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID файла или вложения' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Файл удалён' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Файл не найден' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Вы не авторизованы!' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Ошибка сервера!' })
  async deleteAny(@Param('id') id: string) {
    // Ищем сначала файл
    const fileEntity = await this.fileService.findOne(id);
    if (fileEntity) {
      const fullPath = path.join(process.cwd(), fileEntity.path);
      try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (err) { console.error(err); }
      await this.fileService.delete(id);
      return { message: 'Файл удалён' };
    }

    // Ищем вложение
    const attachmentEntity = await this.attachmentService.findOne(id);
    if (attachmentEntity) {
      const fullPath = path.join(process.cwd(), attachmentEntity.attachmentPath);
      try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (err) { console.error(err); }
      await this.attachmentService.delete(id);
      return { message: 'Файл удалён' };
    }

    return { message: 'Файл не найден' };
  }




}
