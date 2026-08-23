'use client';

import { useState } from 'react';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Pagination } from '@/components/attractions/Pagination';
import { StarRating } from '@/components/attractions/StarRating';
import {
  useCreateReview,
  useDeleteReview,
  useReviews,
  useToggleReviewHelpful,
  useUpdateReview,
} from '@/lib/queries/reviews';
import { useAuthStore } from '@/stores/auth.store';

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function WriteReviewForm({ attractionId, onDone }: { attractionId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const createReview = useCreateReview(attractionId);

  async function submit() {
    if (comment.trim().length < 5) {
      toast.error('Please write a few words about your visit');
      return;
    }
    try {
      await createReview.mutateAsync({ rating, comment });
      toast.success('Review posted');
      setComment('');
      onDone();
    } catch {
      toast.error('Could not post your review');
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <StarRating value={rating} onChange={setRating} size={22} />
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Share your experience…"
        rows={3}
      />
      <Button type="button" onClick={submit} disabled={createReview.isPending}>
        {createReview.isPending ? 'Posting…' : 'Post review'}
      </Button>
    </div>
  );
}

export function ReviewsSection({
  attractionId,
  averageRating,
  reviewCount,
}: {
  attractionId: string;
  averageRating: number;
  reviewCount: number;
}) {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useReviews(attractionId, page);
  const deleteReview = useDeleteReview(attractionId);
  const toggleHelpful = useToggleReviewHelpful(attractionId);
  const updateReview = useUpdateReview(attractionId, editingId ?? '');

  const myReview = data?.items.find((review) => review.userId === user?.id);
  const showWriteForm = user && !myReview;

  async function saveEdit() {
    try {
      await updateReview.mutateAsync({ rating: editRating, comment: editComment });
      toast.success('Review updated');
      setEditingId(null);
    } catch {
      toast.error('Could not update review');
    }
  }

  return (
    <section>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <StarRating value={averageRating} />
            {averageRating.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
          </div>
        )}
      </div>

      {showWriteForm && (
        <div className="mt-4">
          <WriteReviewForm attractionId={attractionId} onDone={() => setPage(1)} />
        </div>
      )}
      {!user && <p className="mt-4 text-sm text-muted-foreground">Log in to leave a review.</p>}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : data?.items.length ? (
          data.items.map((review) => {
            const isMine = review.userId === user?.id;
            const isEditing = editingId === review.id;

            return (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{review.user?.fullName ?? 'Visit Yaoundé user'}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <StarRating value={review.rating} size={14} />
                      {timeAgo(review.createdAt)}
                    </div>
                  </div>
                  {isMine && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(review.id);
                          setEditComment(review.comment);
                          setEditRating(review.rating);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete review"
                        onClick={() => deleteReview.mutate(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-2">
                    <StarRating value={editRating} onChange={setEditRating} />
                    <Textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={updateReview.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
                )}

                {!isMine && user && (
                  <button
                    type="button"
                    onClick={() => toggleHelpful.mutate(review.id)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({review.helpfulCount})
                  </button>
                )}
                {(isMine || !user) && review.helpfulCount > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">{review.helpfulCount} found this helpful</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet — be the first to share your experience.</p>
        )}
      </div>

      {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
    </section>
  );
}
