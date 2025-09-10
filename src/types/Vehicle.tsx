export type Vehicle = {
  id: string;
  title: string;
  image: string;
  kms: string;
  fuel: string;
  owner: string;
  region: string;
  has_bidded: boolean;
  bidding_status: 'Winning' | 'Losing' | null;
  isFavorite?: boolean;
  endTime?: string;
  manager_name: string;
  manager_phone: string;
  hasBid?: boolean;
  bid_created_dttm?: string;
  user_bid_amount?: string;
  status?: string;
};