export type Vehicle = {
    id: string;
    title: string;
    image: string;
    kms: string;
    fuel: string;
    img_extension?: string;
    owner: string;
    region: string;
    status: 'Winning' | 'Losing';
    isFavorite?: boolean;
    endTime?: string;
    manager_name: string;
    manager_phone: string;
  };