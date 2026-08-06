export interface Contact {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  category: string;
  grade?: string;
  email: string;
  phone: string;
  altPhone?: string;
  officeAddress: string;
  city: string;
  state: string;
  pincode?: string;
  reportsTo: string | null;
  photo?: string | null;
  dateOfJoining?: string;
  status: 'active' | 'inactive';
  bloodGroup?: string;
  emergencyContact?: string;
  officeLocation?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;

export interface Filters {
  q?: string;
  department?: string;
  category?: string;
  city?: string;
  state?: string;
  status?: string;
  tag?: string;
}
