export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  latestPostDate: string | null;
  _count: {
    posts: number;
  };
}
