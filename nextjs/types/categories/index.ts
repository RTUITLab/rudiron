
export interface Category {
    name: string;
    color: string;
}

export interface CategoriesData {
    categories: Categories;
}

type Categories = Category[];

export default Categories;