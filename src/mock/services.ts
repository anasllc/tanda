export type NetworkProvider = 'mtn' | 'airtel' | 'glo' | '9mobile';
export type ElectricityProvider = 'IKEDC' | 'EKEDC' | 'AEDC' | 'PHED' | 'KEDCO' | 'IBEDC' | 'KAEDCO' | 'JEDC' | 'BEDC' | 'EEDC';
export type CableProvider = 'dstv' | 'gotv' | 'startimes' | 'showmax';

export interface DataPlan {
  id: string;
  network: NetworkProvider;
  name: string;
  dataAmount: string;
  validity: string;
  price: number;
  isPopular?: boolean;
}

export interface CablePlan {
  id: string;
  provider: CableProvider;
  name: string;
  channels: number;
  price: number;
  validity: string;
  isPopular?: boolean;
}

export interface AirtimeQuickAmount {
  amount: number;
  isPopular?: boolean;
}

export const networks: { id: NetworkProvider; name: string; color: string }[] = [
  { id: 'mtn', name: 'MTN', color: '#FFCC00' },
  { id: 'airtel', name: 'Airtel', color: '#FF0000' },
  { id: 'glo', name: 'Glo', color: '#00FF00' },
  { id: '9mobile', name: '9mobile', color: '#006400' },
];

export const airtimeQuickAmounts: AirtimeQuickAmount[] = [
  { amount: 100 },
  { amount: 200 },
  { amount: 500, isPopular: true },
  { amount: 1000, isPopular: true },
  { amount: 2000 },
  { amount: 5000 },
];

export const dataPlans: DataPlan[] = [
  // MTN Plans
  { id: 'mtn_500mb', network: 'mtn', name: 'MTN 500MB', dataAmount: '500MB', validity: '30 days', price: 500 },
  { id: 'mtn_1gb', network: 'mtn', name: 'MTN 1GB', dataAmount: '1GB', validity: '30 days', price: 1000, isPopular: true },
  { id: 'mtn_2gb', network: 'mtn', name: 'MTN 2GB', dataAmount: '2GB', validity: '30 days', price: 1500 },
  { id: 'mtn_3gb', network: 'mtn', name: 'MTN 3GB', dataAmount: '3GB', validity: '30 days', price: 2000 },
  { id: 'mtn_5gb', network: 'mtn', name: 'MTN 5GB', dataAmount: '5GB', validity: '30 days', price: 3500, isPopular: true },
  { id: 'mtn_10gb', network: 'mtn', name: 'MTN 10GB', dataAmount: '10GB', validity: '30 days', price: 5000 },
  { id: 'mtn_20gb', network: 'mtn', name: 'MTN 20GB', dataAmount: '20GB', validity: '30 days', price: 10000 },
  // Airtel Plans
  { id: 'airtel_500mb', network: 'airtel', name: 'Airtel 500MB', dataAmount: '500MB', validity: '30 days', price: 500 },
  { id: 'airtel_1gb', network: 'airtel', name: 'Airtel 1GB', dataAmount: '1GB', validity: '30 days', price: 1000 },
  { id: 'airtel_2gb', network: 'airtel', name: 'Airtel 2GB', dataAmount: '2GB', validity: '30 days', price: 1500, isPopular: true },
  { id: 'airtel_5gb', network: 'airtel', name: 'Airtel 5GB', dataAmount: '5GB', validity: '30 days', price: 3500 },
  { id: 'airtel_10gb', network: 'airtel', name: 'Airtel 10GB', dataAmount: '10GB', validity: '30 days', price: 5000 },
  // Glo Plans
  { id: 'glo_1gb', network: 'glo', name: 'Glo 1GB', dataAmount: '1GB', validity: '30 days', price: 800 },
  { id: 'glo_2gb', network: 'glo', name: 'Glo 2GB', dataAmount: '2GB', validity: '30 days', price: 1200, isPopular: true },
  { id: 'glo_5gb', network: 'glo', name: 'Glo 5GB', dataAmount: '5GB', validity: '30 days', price: 2500 },
  { id: 'glo_10gb', network: 'glo', name: 'Glo 10GB', dataAmount: '10GB', validity: '30 days', price: 4500 },
  // 9mobile Plans
  { id: '9mobile_1gb', network: '9mobile', name: '9mobile 1GB', dataAmount: '1GB', validity: '30 days', price: 1000 },
  { id: '9mobile_2gb', network: '9mobile', name: '9mobile 2GB', dataAmount: '2GB', validity: '30 days', price: 1800 },
  { id: '9mobile_5gb', network: '9mobile', name: '9mobile 5GB', dataAmount: '5GB', validity: '30 days', price: 3500 },
  { id: '9mobile_10gb', network: '9mobile', name: '9mobile 10GB', dataAmount: '10GB', validity: '30 days', price: 5000, isPopular: true },
];

export const electricityProviders: { id: ElectricityProvider; name: string; states: string[] }[] = [
  { id: 'IKEDC', name: 'Ikeja Electric', states: ['Lagos'] },
  { id: 'EKEDC', name: 'Eko Electricity', states: ['Lagos'] },
  { id: 'AEDC', name: 'Abuja Electricity', states: ['FCT', 'Kogi', 'Niger', 'Nasarawa'] },
  { id: 'PHED', name: 'Port Harcourt Electric', states: ['Rivers', 'Cross River', 'Akwa Ibom', 'Bayelsa'] },
  { id: 'KEDCO', name: 'Kano Electricity', states: ['Kano', 'Jigawa', 'Katsina'] },
  { id: 'IBEDC', name: 'Ibadan Electricity', states: ['Oyo', 'Ogun', 'Osun', 'Kwara'] },
  { id: 'KAEDCO', name: 'Kaduna Electricity', states: ['Kaduna', 'Sokoto', 'Kebbi', 'Zamfara'] },
  { id: 'JEDC', name: 'Jos Electricity', states: ['Plateau', 'Bauchi', 'Benue', 'Gombe'] },
  { id: 'BEDC', name: 'Benin Electricity', states: ['Edo', 'Delta', 'Ondo', 'Ekiti'] },
  { id: 'EEDC', name: 'Enugu Electricity', states: ['Enugu', 'Anambra', 'Imo', 'Abia', 'Ebonyi'] },
];

export const cablePlans: CablePlan[] = [
  // DStv Plans
  { id: 'dstv_padi', provider: 'dstv', name: 'DStv Padi', channels: 40, price: 2150, validity: '30 days' },
  { id: 'dstv_yanga', provider: 'dstv', name: 'DStv Yanga', channels: 65, price: 2950, validity: '30 days' },
  { id: 'dstv_confam', provider: 'dstv', name: 'DStv Confam', channels: 95, price: 6200, validity: '30 days', isPopular: true },
  { id: 'dstv_compact', provider: 'dstv', name: 'DStv Compact', channels: 135, price: 10500, validity: '30 days' },
  { id: 'dstv_compact_plus', provider: 'dstv', name: 'DStv Compact Plus', channels: 165, price: 16600, validity: '30 days', isPopular: true },
  { id: 'dstv_premium', provider: 'dstv', name: 'DStv Premium', channels: 185, price: 24500, validity: '30 days' },
  // GOtv Plans
  { id: 'gotv_smallie', provider: 'gotv', name: 'GOtv Smallie', channels: 30, price: 1100, validity: '30 days' },
  { id: 'gotv_jinja', provider: 'gotv', name: 'GOtv Jinja', channels: 40, price: 2250, validity: '30 days' },
  { id: 'gotv_jolli', provider: 'gotv', name: 'GOtv Jolli', channels: 60, price: 3300, validity: '30 days', isPopular: true },
  { id: 'gotv_max', provider: 'gotv', name: 'GOtv Max', channels: 75, price: 4850, validity: '30 days' },
  { id: 'gotv_supa', provider: 'gotv', name: 'GOtv Supa', channels: 90, price: 6400, validity: '30 days' },
  // Startimes Plans
  { id: 'startimes_nova', provider: 'startimes', name: 'Nova', channels: 35, price: 1200, validity: '30 days' },
  { id: 'startimes_basic', provider: 'startimes', name: 'Basic', channels: 60, price: 2100, validity: '30 days' },
  { id: 'startimes_smart', provider: 'startimes', name: 'Smart', channels: 75, price: 2900, validity: '30 days', isPopular: true },
  { id: 'startimes_classic', provider: 'startimes', name: 'Classic', channels: 95, price: 3000, validity: '30 days' },
  { id: 'startimes_super', provider: 'startimes', name: 'Super', channels: 115, price: 5500, validity: '30 days' },
];

export const cableProviders: { id: CableProvider; name: string }[] = [
  { id: 'dstv', name: 'DStv' },
  { id: 'gotv', name: 'GOtv' },
  { id: 'startimes', name: 'StarTimes' },
  { id: 'showmax', name: 'Showmax' },
];

export const getDataPlansByNetwork = (network: NetworkProvider): DataPlan[] => {
  return dataPlans.filter(plan => plan.network === network);
};

export const getCablePlansByProvider = (provider: CableProvider): CablePlan[] => {
  return cablePlans.filter(plan => plan.provider === provider);
};

export const getPopularDataPlans = (): DataPlan[] => {
  return dataPlans.filter(plan => plan.isPopular);
};

export const getPopularCablePlans = (): CablePlan[] => {
  return cablePlans.filter(plan => plan.isPopular);
};
