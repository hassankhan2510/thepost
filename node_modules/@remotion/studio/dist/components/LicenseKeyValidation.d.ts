import React from 'react';
export type LicenseKeyDetails = {
    readonly isValid: boolean;
    readonly hasActiveSubscription: boolean | null;
    readonly projectName: string;
    readonly projectSlug: string;
};
export declare const hasActiveCompanyLicense: (details: LicenseKeyDetails) => boolean;
export type LicenseKeyValidationResult = {
    readonly valid: boolean;
    readonly message: string | null;
};
export declare const validateLicenseKey: (key: string) => LicenseKeyValidationResult;
export declare const fetchLicenseKeyDetails: (licenseKey: string) => Promise<LicenseKeyDetails>;
export declare const LicenseKeyDetailsDisplay: React.FC<{
    readonly details: LicenseKeyDetails;
}>;
