export type Division = {
  id: number;
  nameEn: string;
  nameBn: string;
  districtCount: number;
  createdAt: string;
  districts?: District[];
};

export type District = {
  id: number;
  nameEn: string;
  nameBn: string;
  divisionId: number;
  upazilaCount: number;
  createdAt: string;
  division?: Division;
  upazilas?: Upazila[];
};

export type Upazila = {
  id: number;
  nameEn: string;
  nameBn: string;
  districtId: number;
  district?: District;
  isUrban: boolean;
  createdAt: string;
  updatedAt: string;
};
