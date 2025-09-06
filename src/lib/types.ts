export interface Pitch {
  id: number;
  title: string;
  description: string;
  presenter: string;
  imageUrl: string;
  rating: number; // This is now the average rating
  ratings: number[]; // Store individual ratings to calculate the average
  visible: boolean;
  category: string;
}
