import type { Metadata } from 'next'
import { getAllComments } from '@/lib/supabase/queries/comments'
import { DeleteForm } from '@/components/admin/DeleteForm'
import { deleteCommentAction } from './actions'

export const metadata: Metadata = { title: 'Comments — Admin' }

export default async function AdminCommentsPage() {
  const comments = await getAllComments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{comments.length} total</p>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">No comments yet.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Content</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Upvotes</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{comment.authorName}</td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{comment.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                      {comment.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{comment.upvotes}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        comment.isApproved
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {comment.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteForm
                      id={comment.id}
                      deleteAction={deleteCommentAction}
                      redirectPath="/admin/comments"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
