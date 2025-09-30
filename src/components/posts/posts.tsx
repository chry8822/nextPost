'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '@/lib/utils';
import { renderMarkdownToHtml } from '@/lib/markdown';
import { Button } from '../ui/button';
import { MessageCircle } from 'lucide-react';
import LikeButton from './like-button';
import { Post } from '@/app/posts/types';

export default function Posts({ posts }: { posts: Post[] }) {
  return (
    <>
      {posts.slice(0, 4).map((post, idx) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
          <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {formatDate(post.createdAt)} • {post.author.name || post.author.username}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow pt-0">
              <p className="text-gray-600  line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(post.excerpt) }} />
              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(({ tag }) => (
                    <span key={tag.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded transition-colors">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 mt-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-1">
                  <LikeButton initialLiked={post.isLiked} postSlug={post.slug} initialLikeCount={post._count.likes} />
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="noneBox" className="p-0">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{post._count.comments}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </>
  );
}
