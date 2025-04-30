export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface JwtResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
  }
  
  export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    roles?: string[];
  }