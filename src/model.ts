export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    tax: Tax;
}
export interface Tax {
    state: number;
    county: number;
    city: number;
    total: number;
}
