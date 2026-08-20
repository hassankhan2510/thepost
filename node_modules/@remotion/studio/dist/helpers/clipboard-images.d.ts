export declare const hasClipboardImage: (clipboardData: DataTransfer) => boolean;
export declare const getUniqueClipboardImageName: ({ existingFileNames, fileName, mimeType, }: {
    existingFileNames: Set<string>;
    fileName: string;
    mimeType: string;
}) => string;
export declare const getClipboardImageFiles: ({ clipboardData, existingFileNames, }: {
    clipboardData: DataTransfer;
    existingFileNames: string[];
}) => File[];
