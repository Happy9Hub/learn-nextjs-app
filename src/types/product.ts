export interface Product {
    id:          number;
    barcode:     string;
    name:        string;
    description: null;
    price:       string;
    cost:        string;
    stock:       number;
    categoryId:  number;
    createdAt:   Date;
    updatedAt:   Date;
    category:    Category;
}

export interface Category {
    id:          number;
    name:        string;
    description: string;
    createdAt:   Date;
    updatedAt:   Date;
}
