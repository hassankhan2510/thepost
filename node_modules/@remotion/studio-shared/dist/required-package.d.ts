import type { InsertableCompositionElement } from './api-requests';
export { isValidPackageName } from './package-name';
export declare const getRequiredPackageForImportPath: (importPath: string) => string | null;
export declare const getRequiredPackageForInsertableElement: (element: InsertableCompositionElement) => string | null;
export declare const getRequiredPackageForEffectImportPath: (importPath: string) => string | null;
