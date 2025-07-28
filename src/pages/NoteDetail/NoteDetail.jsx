"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ID } from "../../lib/appwrite"
import { Heart, MessageCircle, Download, Share2, Calendar, Tag, ArrowLeft } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const NoteDetail = () => {
  const { noteId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchNoteDetails()
  }, [noteId])

  const fetchNoteDetails = async () => {
    try {
      setLoading(true)

      // Fetch note details
      const noteResponse = await databases.getDocument(DATABASE_ID, COLLECTIONS.NOTES, noteId)

      setNote(noteResponse)

      // TODO: Check if user has liked this note
      // TODO: Fetch comments for this note
    } catch (error) {
      console.error("Error fetching note details:", error)
      toast.error("Failed to load note details")
      navigate("/")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const newLikeCount = liked ? note.likes - 1 : note.likes + 1

      // Update local state immediately for better UX
      setLiked(!liked)
      setNote((prev) => ({ ...prev, likes: newLikeCount }))

      // Update in database
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTES, noteId, { likes: newLikeCount })

      // TODO: Add/remove like record in likes collection
    } catch (error) {
      // Revert local state on error
      setLiked(liked)
      setNote((prev) => ({ ...prev, likes: liked ? note.likes : note.likes - 1 }))
      toast.error("Failed to update like")
    }
  }

  const handleDownload = async () => {
    try {
      // Get download URL
      const downloadUrl = storage.getFileDownload(BUCKET_ID, note.fileId)

      // Create download link
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = note.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update download count
      const newDownloadCount = (note.downloads || 0) + 1
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTES, noteId, { downloads: newDownloadCount })

      setNote((prev) => ({ ...prev, downloads: newDownloadCount }))
      toast.success("Download started!")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download file")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href,
      })
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmittingComment(true)

      // TODO: Add comment to database
      const commentData = {
        noteId,
        userId: user.$id,
        userName: user.name,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      }

      // Add to local state immediately
      setComments((prev) => [commentData, ...prev])
      setNewComment("")

      // Update comment count
      const newCommentCount = (note.comments || 0) + 1
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.NOTES, noteId, { comments: newCommentCount })

      setNote((prev) => ({ ...prev, comments: newCommentCount }))
      toast.success("Comment added!")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Note not found</h2>
        <button onClick={() => navigate("/")} className="btn-primary">
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Note Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{note.authorName?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{note.authorName || "Anonymous"}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(note.$createdAt)}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 text-sm rounded-full ${
              note.type === "note"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {note.type === "note" ? "Study Note" : "Question Paper"}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{note.title}</h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{note.description}</p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {note.subject && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
              <p className="font-medium text-gray-900 dark:text-white">{note.subject}</p>
            </div>
          )}
          {note.academicYear && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
              <p className="font-medium text-gray-900 dark:text-white">{note.academicYear}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatFileSize(note.fileSize)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p>
            <p className="font-medium text-gray-900 dark:text-white">{note.downloads || 0}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                liked
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{note.likes || 0}</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{note.comments || 0}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button onClick={handleDownload} className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h3>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">PDF preview will be implemented here using PDF.js</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">File: {note.fileName}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Comments ({note.comments || 0})</h3>

        {/* Add Comment Form */}
        <form onSubmit={submitComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="input-field resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="btn-primary flex items-center space-x-2"
                >
                  {submittingComment ? <LoadingSpinner size="sm" /> : <MessageCircle className="w-4 h-4" />}
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {comment.userName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{comment.userName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteDetail
