export interface Post {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  isLiked: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}
