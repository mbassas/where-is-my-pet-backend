export interface UserInput {
    name: string;
    surname: string;
    email: string;
    phone: string;
    username: string;
    password: string;
}

export interface User extends UserInput {
    id: number;
}
