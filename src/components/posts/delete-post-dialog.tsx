// src/components/posts/delete-post-dialog.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeletePostDialogProps {
  postTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeletePostDialog({ postTitle, onConfirm, onCancel, loading = false }: DeletePostDialogProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          포스트 삭제
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            정말로 <strong>"{postTitle}"</strong> 포스트를 삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">⚠️ 이 작업은 되돌릴 수 없습니다. 포스트와 관련된 모든 댓글, 좋아요가 함께 삭제됩니다.</p>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              취소
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={loading} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
