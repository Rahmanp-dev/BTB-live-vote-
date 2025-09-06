export interface Pitch {
  _id: string; // Changed from id to _id for MongoDB
  title: string;
  description: string;
  presenter: string;
  imageUrl: string;
  rating: number; // This is now the average rating
  ratings: number[]; // Store individual ratings to calculate the average
  visible: boolean;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
}
