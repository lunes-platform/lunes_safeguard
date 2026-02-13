export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  tags?: string[];
  content: string; // simple markdown/plain for mock
};

// Source data from JSON so build tools and scripts can consume it too
import jsonData from './blogData.json';
export const blogPosts: BlogPost[] = jsonData as BlogPost[];
