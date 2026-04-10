export interface Category {
  id: string;
  name: string;
  description: string;
  tags: string[];
  items: string[];
  hints?: string[];
}
