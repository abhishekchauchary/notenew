"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { databases, storage, DATABASE_ID, COLLECTIONS, BUCKET_ID } from "../../lib/appwrite"
import { UploadIcon, X, FileText } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import toast from "react-hot-toast"

const Upload = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please select a PDF file")
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB")
        return
      }
      setFile(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const onSubmit = async (data) => {
    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to Appwrite Storage
      const fileUpload = await storage.createFile(BUCKET_ID, "unique()", file)

      setUploadProgress(50)

      // Create note document in database
      const noteData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        academicYear: data.academicYear,
        type: data.type,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        fileId: fileUpload.$id,
        fileName: file.name,
        fileSize: file.size,
        authorId: user.$id,
        authorName: user.name,
        likes: 0,
        comments: 0,
        downloads: 0,
      }

      const noteDocument = await databases.createDocument(DATABASE_ID, COLLECTIONS.NOTES, "unique()", noteData)

      setUploadProgress(100)
      toast.success("Note uploaded successfully!")

      // Reset form and navigate
      reset()
      setFile(null)
      navigate(`/note/${noteDocument.$id}`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload note. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Study Material</h1>
        <p className="text-gray-600 dark:text-gray-400">Share your notes and question papers with the community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload PDF File *</label>

          {!file ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Click to upload PDF</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maximum file size: 10MB</p>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              className="input-field"
              placeholder="Enter a descriptive title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              rows={4}
              className="input-field"
              placeholder="Describe what this material covers"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
              <input
                {...register("subject", { required: "Subject is required" })}
                type="text"
                className="input-field"
                placeholder="e.g., Mathematics, Physics"
              />
              {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Year</label>
              <select {...register("academicYear")} className="input-field">
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select {...register("type", { required: "Type is required" })} className="input-field">
              <option value="">Select type</option>
              <option value="note">Study Notes</option>
              <option value="question">Question Paper</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
            <input
              {...register("tags")}
              type="text"
              className="input-field"
              placeholder="Enter tags separated by commas (e.g., calculus, derivatives, limits)"
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Separate multiple tags with commas</p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/")} className="btn-secondary" disabled={uploading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center space-x-2" disabled={uploading || !file}>
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4" />
                <span>Upload Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Upload
