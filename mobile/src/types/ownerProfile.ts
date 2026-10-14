export type OwnerProfile = {
  name: string; email: string; phone: string; businessName: string; city: string; introduction: string; photoUri?: string;
  verification: 'Not submitted' | 'Under review' | 'Verified';
  identityDocument?: { name: string; uri: string; type: 'National ID' | 'Passport' };
  payouts: { id: string; provider: 'MTN MoMo' | 'Orange Money'; holder: string; number: string }[];
  defaultPayoutId?: string;
  pickupAddress: string; returnAddress: string;
  notifications: Record<string, boolean>;
  language: 'English' | 'French';
};
export const initialOwnerProfile: OwnerProfile = {
  name: 'Munoh Nguchi', email: 'munohnguchi334@gmail.com', phone: '', businessName: '', city: '', introduction: '', verification: 'Not submitted', payouts: [], pickupAddress: '', returnAddress: '', language: 'English',
  notifications: { 'New booking requests': true, 'Pickup and return reminders': true, 'Rental cancellations': true, 'Payout updates': true, 'Vehicle-document expiry reminders': true, Messages: true },
};
