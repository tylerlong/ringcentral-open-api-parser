import { NamedSchema } from '../../types';

export const handleSpecialCases = () => {
  // attachment
  const Attachment: NamedSchema = {
    name: 'Attachment',
    description: 'Attachment is a file to be uploaded',
    required: ['content'],
    properties: {
      filename: {
        type: 'string',
        description: 'Filename with extension, such as "image.png"',
      },
      content: {
        type: 'string',
        format: 'binary',
        description: 'Binary content of the file',
      },
      contentType: {
        type: 'string',
        description: 'Content type of the file, such as "image/png"',
      },
    },
  };
  return [Attachment];
};
