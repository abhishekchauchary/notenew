"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, MessageCircle, Download, Calendar, Tag, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const NoteCard = ({ note }) => {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(note.likes || 0)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Toggle like state
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))

    // TODO: Implement actual like functionality with Appwrite
  }

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Recently"
    }
  }

  return (
    <Link to={`/note/${note.$id}`} className="block">
      <div className="card hover:shadow-md transition-shadow duration-200 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{note.authorName?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{note.authorName || "Anonymous"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(note.$createdAt)}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              note.type === "note"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {note.type === "note" ? "Note" : "Question Paper"}
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{note.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{note.description}</p>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">+{note.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Subject & Year */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          {note.subject && (
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {note.subject}
            </span>
          )}
          {note.academicYear && <span>Year: {note.academicYear}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                liked ? "text-red-600" : "text-gray-500 dark:text-gray-400 hover:text-red-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>

            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{note.comments || 0}</span>
            </button>
          </div>

          <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default NoteCard
