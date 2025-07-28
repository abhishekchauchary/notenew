"use client"

import { useState, useEffect } from "react"
import { databases, DATABASE_ID, COLLECTIONS, Query } from "../../lib/appwrite"
import NoteCard from "../../components/Notes/NoteCard"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import { RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

const Home = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTES, [
        Query.orderDesc("$createdAt"),
        Query.limit(20),
      ])

      setNotes(response.documents)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchNotes(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Notes & Papers</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover study materials shared by the community</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Be the first to share your study materials!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.$id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
