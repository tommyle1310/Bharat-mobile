export type Vehicle = {
  id: string;
  title: string;
  image: string;
  kms: string;
  fuel: string;
  owner: string;
  region: string;
  transmissionType: string;
  rc_availability: boolean;
  repo_date: string;
  regs_no: string;
  has_bidded: boolean;
  bidding_status: 'Winning' | 'Losing';
  isFavorite?: boolean;
  endTime?: string;
  manager_name: string;
  manager_phone: string;
  hasBid?: boolean;
  bid_created_dttm?: string;
  user_bid_amount?: string;
};

function ordinal(n: number) {
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatKm(value: string) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

export const getVehicles = (): Vehicle[] => {
  const raw: Array<{
    vehicle_id: string;
    end_time: string;
    odometer: string;
    fuel: string;
    owner_serial: string;
    state_rto: string;
    make: string;
    model: string;
    variant: string;
    manufacture_year: string;
    main_image: string;
    status: 'Winning' | 'Losing';
    is_favorite?: boolean;
    manager_name: string;
    manager_phone: string;
    transmissionType: string;
    rc_availability: boolean;
    repo_date: string;
    regs_no: string;
    has_bidded?: boolean;
    has_bid?: boolean;
  }> = require('./vehicleListScreen.json');

  return raw.map(v => ({
    id: v.vehicle_id,
    title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
    image: v.main_image,
    kms: formatKm(v.odometer),
    fuel: v.fuel,
    owner: `${ordinal(Number(v.owner_serial))} Owner`,
    region: v.state_rto,
    has_bidded: v.has_bidded ?? false,
    bidding_status: v.status,
    isFavorite: v.is_favorite ?? false,
    endTime: v.end_time,
    manager_name: v.manager_name,
    manager_phone: v.manager_phone,
    hasBid: v.has_bid ?? false,
    transmissionType: v.transmissionType,
    rc_availability: v.rc_availability,
    repo_date: v.repo_date,
    regs_no: v.regs_no,
  }));
};


