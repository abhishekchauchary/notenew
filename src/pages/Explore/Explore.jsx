"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { databases, DATABASE_ID, COLLECTIONS, Query } from "../../lib/appwrite"
import { Search, Filter, BookOpen, FileText } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import NoteCard from "../../components/Notes/NoteCard"
import toast from "react-hot-toast"

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "all",
    subject: searchParams.get("subject") || "",
    year: searchParams.get("year") || "",
    sortBy: searchParams.get("sortBy") || "recent",
  })
  const [showFilters, setShowFilters] = useState(false)

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Engineering",
    "Economics",
    "History",
    "Literature",
    "Psychology",
  ]

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters", "PhD"]

  useEffect(() => {
    fetchNotes()
  }, [searchQuery, filters])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (filters.type !== "all") params.set("type", filters.type)
    if (filters.subject) params.set("subject", filters.subject)
    if (filters.year) params.set("year", filters.year)
    if (filters.sortBy !== "recent") params.set("sortBy", filters.sortBy)

    setSearchParams(params)
  }, [searchQuery, filters, setSearchParams])

  const fetchNotes = async () => {
    try {
      setLoading(true)

      const queries = [Query.limit(50)]

      // Add search query
      if (searchQuery) {
        queries.push(Query.search("title", searchQuery))
      }

      // Add type filter
      if (filters.type !== "all") {
        queries.push(Query.equal("type", filters.type))
      }

      // Add subject filter
      if (filters.subject) {
        queries.push(Query.equal("subject", filters.subject))
      }

      // Add year filter
      if (filters.year) {
        queries.push(Query.equal("academicYear", filters.year))
      }

      // Add sorting
      switch (filters.sortBy) {
        case "popular":
          queries.push(Query.orderDesc("likes"))
          break
        case "downloads":
          queries.push(Query.orderDesc("downloads"))
          break
        case "recent":
        default:
          queries.push(Query.orderDesc("$createdAt"))
          break
      }

      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTES, queries)

      setNotes(response.documents)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchNotes()
  }

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      subject: "",
      year: "",
      sortBy: "recent",
    })
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Study Materials</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover notes and question papers from the community</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes, subjects, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="note">Study Notes</option>
                <option value="question">Question Papers</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => updateFilter("subject", e.target.value)}
                className="input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Academic Year</label>
              <select
                value={filters.year}
                onChange={(e) => updateFilter("year", e.target.value)}
                className="input-field"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="input-field"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {notes.length} {notes.length === 1 ? "result" : "results"} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{notes.filter((n) => n.type === "note").length} Notes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{notes.filter((n) => n.type === "question").length} Papers</span>
                </div>
              </div>
            </div>

            {/* Notes Grid */}
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <NoteCard key={note.$id} note={note} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Explore
