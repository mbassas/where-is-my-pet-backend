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
    recovered: boolean;
    published: boolean;
}

export interface Animal extends AnimalInput {
    location_id: any;
    id: number;
    user_id: number;
    publication_date: string;
}

