import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadFolder,
  UploadOptions,
  UploadResult,
  UploadError,
  CloudinaryTransformation,
} from '../types/upload.types';

export class UploadService {
  private static instance: UploadService;

  static getInstance(): UploadService {
    if (!this.instance) {
      this.instance = new UploadService();
    }
    return this.instance;
  }

  private getDefaultConfig(folder: UploadFolder): Partial<UploadOptions> {
    const configs: Record<UploadFolder, Partial<UploadOptions>> = {
      [UploadFolder.USERS]: {
        maxFileSize: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        transformation: {
          width: 400,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: true,
      },
      [UploadFolder.SHOPS]: {
        maxFileSize: 3 * 1024 * 1024, // 3MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        transformation: {
          width: 600,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: true,
      },
      [UploadFolder.PRODUCTS]: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        transformation: {
          width: 1200,
          height: 1200,
          crop: 'fit',
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: true,
      },
      [UploadFolder.CATEGORIES]: {
        maxFileSize: 1 * 1024 * 1024, // 1MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        transformation: {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: false,
      },
      [UploadFolder.KYC_DOCUMENTS]: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        transformation: {
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: false,
      },
      [UploadFolder.GENERAL]: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        transformation: {
          quality: 'auto',
          format: 'auto',
        },
        generateThumbnail: false,
      },
    };

    return configs[folder] ?? configs[UploadFolder.GENERAL];
  }

  getMulterMiddleware(options: UploadOptions, maxFiles: number = 1) {
    const config = { ...this.getDefaultConfig(options.folder), ...options };

    const storage = multer.memoryStorage();

    const fileFilter = (
      req: any,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      if (
        config.allowedMimeTypes &&
        !config.allowedMimeTypes.includes(file.mimetype)
      ) {
        return cb(
          new Error(
            `Loại file không được hỗ trợ. Chỉ chấp nhận: ${config.allowedMimeTypes.join(', ')}`
          )
        );
      }

      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.maxFileSize,
        files: maxFiles,
      },
    });
  }

  async uploadSingle(
    file: Express.Multer.File,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const config = { ...this.getDefaultConfig(options.folder), ...options };

      if (config.maxFileSize && file.size > config.maxFileSize) {
        throw new Error(
          `File quá lớn. Kích thước tối đa: ${config.maxFileSize / 1024 / 1024}MB`
        );
      }

      const folderPath = this.generateFolderPath(options);

      const uploadResult = await this.uploadToCloudinary(
        file,
        folderPath,
        config.transformation
      );

      let thumbnailUrl: string | undefined;

      if (config.generateThumbnail && file.mimetype.startsWith('image/')) {
        thumbnailUrl = this.generateThumbnailUrl(uploadResult.public_id, {
          width: 150,
          height: 150,
          crop: 'fill',
          quality: 'auto',
        });
      }

      return {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        originalUrl: uploadResult.url,
        thumbnailUrl: thumbnailUrl ?? '',
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        folder: folderPath
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Upload failed');
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    options: UploadOptions
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadSingle(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  // Xóa multiple files
  async deleteMultiple(publicIds: string[]): Promise<{success: string[], failed: string[]}> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return {
        success: Object.keys(result.deleted).filter(id => result.deleted[id] === 'deleted'),
        failed: Object.keys(result.deleted).filter(id => result.deleted[id] !== 'deleted')
      };
    } catch (error) {
      console.error('Delete multiple files error:', error);
      return { success: [], failed: publicIds };
    }
  }

  private generateFolderPath(options: UploadOptions): string {
    let path: string = options.folder;

    // Tạo sub-folder theo context
    if (options.userId && options.folder === UploadFolder.USERS) {
      path += `/user-${options.userId}`;
    } else if (options.shopId && options.folder === UploadFolder.SHOPS) {
      path += `/shop-${options.shopId}`;
    } else if (options.shopId && options.folder === UploadFolder.PRODUCTS) {
      path += `/shop-${options.shopId}`;
      if (options.productId) {
        path += `/product-${options.productId}`;
      }
    } else if (
      options.userId &&
      options.folder === UploadFolder.KYC_DOCUMENTS
    ) {
      path += `/user-${options.userId}`;
    }

    return path;
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
    transformation?: CloudinaryTransformation
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        unique_filename: true,
        use_filename: false,
        public_id: `${Date.now()}_${uuidv4()}`,
      };

      // Áp dụng transformation
      if (transformation) {
        uploadOptions.transformation = [transformation];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream và pipe
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  private generateThumbnailUrl(
    publicId: string,
    transformation: CloudinaryTransformation
  ): string {
    return cloudinary.url(publicId, {
      transformation: [transformation],
    });
  }

  generateOptimizedUrl(
    publicId: string,
    transformation?: CloudinaryTransformation
  ): string {
    return cloudinary.url(publicId, {
      transformation: transformation ? [transformation] : undefined,
    });
  }

  // Lấy thông tin file từ Cloudinary
  async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }
}
