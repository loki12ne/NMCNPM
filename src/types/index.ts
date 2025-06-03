export interface Question {
  id: number;
  title: string;
  likes: number;
  liked: boolean;
  comments: number;
  tags: string[];
  author: string;
  time: string;
}