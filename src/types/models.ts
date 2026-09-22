export interface UserRegisterInfo {
  userName: string;
  email: string;
  password: string;
}

export interface User extends UserRegisterInfo {
  id: string;
  created_at: Date;
  updated_at: Date;
  role: "admin" | "user";
}

interface LoginWithUserName {
  userName: string;
  password: string;
  userAgent: string;
  ipAddress: string;
}

interface LoginWithEmail {
  email: string;
  password: string;
  userAgent: string;
  ipAddress: string;
}

export type UserLoginInfo = LoginWithUserName | LoginWithEmail;

export interface VerifyUserInfo {
  uuid: string;
  verifyCode: number;
  userAgent: string;
  ipAddress: string;
}

export interface TaskInputInfo {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "done";
  dueDate: Date;
  categoryIds: string[];
}
export interface Task extends TaskInputInfo {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export type PartialUpdateTask = Partial<
  Omit<Task, "id" | "user_id" | "created_at" | "updated_at">
>;
