export interface Role {
  id?: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: (string | Role)[];
  isActive?: boolean;
}
