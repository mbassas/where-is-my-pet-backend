export interface AnimalInput {
    state: number;
    species: number;
    breeds: number;
    size: number;
    color: string;
    name: string;
    gender: number;
    age: string;
    lat: number;
    lng: number;
    images: string;
}

export interface Animal extends AnimalInput {
    id: number;
    user_id: number;
    publication_date: string;
}

