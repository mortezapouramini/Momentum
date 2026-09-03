export interface AuthRequest extends Omit<Request, "body"> {
  user: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
  body: any;
  params: {
    taskId: string;
    noteId?: string;
  };
}