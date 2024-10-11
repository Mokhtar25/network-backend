// graphql Context
export interface MyContext {
  user: Express.User;
  isAuthenticated: () => boolean;
}
