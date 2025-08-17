import { IUserRepository } from "./user.interfaces";

export interface IUnitOfWork {
  users: IUserRepository;
  
  executeInTransaction<T>(operation: (uow: IUnitOfWork) => Promise<T>): Promise<T>; // saveChanges
}