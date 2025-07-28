"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { databases, DATABASE_ID, COLLECTIONS, Query } from "../../lib/appwrite"
import { BookOpen, FileText, Heart, Calendar, Settings } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import NoteCard from "../../components/Notes/NoteCard"
import toast from "react-hot-toast"

const Profile = () => {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("notes")
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalLikes: 0,
    totalDownloads: 0,
  })

  const isOwnProfile = !userId || userId === currentUser?.$id

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // If viewing own profile or no userId provided, use current user
      const targetUserId = userId || currentUser.$id

      // For now, we'll use the current user data
      // In a real app, you'd fetch user data from a users collection
      setUser(currentUser)

      // Fetch user's notes
      const notesResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTES, [
        Query.equal("authorId", targetUserId),
        Query.orderDesc("$createdAt"),
      ])

      setNotes(notesResponse.documents)

      // Calculate stats
      const totalNotes = notesResponse.documents.length
      const totalLikes = notesResponse.documents.reduce((sum, note) => sum + (note.likes || 0), 0)
      const totalDownloads = notesResponse.documents.reduce((sum, note) => sum + (note.downloads || 0), 0)

      setStats({ totalNotes, totalLikes, totalDownloads })
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "notes", label: "My Notes", icon: FileText },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "todos", label: "To-Do", icon: BookOpen },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name || "User"}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {new Date(user?.$createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <button className="btn-secondary flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Notes Shared</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "notes" && (
          <div>
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile ? "Start sharing your study materials!" : "This user hasn't shared any notes yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard key={note.$id} note={note} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved notes</h3>
            <p className="text-gray-600 dark:text-gray-400">Notes you like will appear here</p>
          </div>
        )}

        {activeTab === "todos" && isOwnProfile && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">View your todos</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Manage your study tasks and goals</p>
            <button onClick={() => (window.location.href = "/todo")} className="btn-primary">
              Go to To-Do List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
