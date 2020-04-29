export interface AnimalInput {
    status: string;
    species: string;
    breed: string;
    size: string;
    color: string;
    name: string;
    gender: string;
    age: string;
    lat: number;
    lng: number;
    location: string;
}

export interface Animal extends AnimalInput {
    id: number;
    user_id: number;
    publication_date: string;
}

