import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  // Media goes to any S3-compatible bucket once S3_BUCKET is set. Without it, files land in public/uploads (dev only).
  const useS3 = Boolean(env('S3_BUCKET', ''));

  return {
    upload: {
      config: {
        ...(useS3
          ? {
              provider: 'aws-s3',
              providerOptions: {
                // Public base URL for stored files (CDN or bucket domain). Falls back to the provider's own URL.
                baseUrl: env('S3_PUBLIC_URL', '') || undefined,
                rootPath: env('S3_ROOT_PATH', '') || undefined,
                s3Options: {
                  credentials: {
                    accessKeyId: env('S3_ACCESS_KEY_ID'),
                    secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
                  },
                  region: env('S3_REGION', 'auto'),
                  endpoint: env('S3_ENDPOINT', '') || undefined,
                  forcePathStyle: env.bool('S3_FORCE_PATH_STYLE', true),
                  // Newer SDK defaults add checksums that some S3-compatible stores reject.
                  requestChecksumCalculation: 'WHEN_REQUIRED',
                  responseChecksumValidation: 'WHEN_REQUIRED',
                  params: {
                    Bucket: env('S3_BUCKET'),
                    // Leave S3_ACL unset for buckets with ACLs disabled (R2, modern AWS). Set public-read if you need it.
                    // null (not undefined) keeps the key present, so the provider skips its public-read default.
                    ACL: env('S3_ACL', '') || null,
                  },
                },
              },
              actionOptions: { upload: {}, uploadStream: {}, delete: {} },
            }
          : {}),
        security: {
          allowedTypes: allowedMediaTypes,
          deniedTypes,
        },
      },
    },
  };
};

export default config;
