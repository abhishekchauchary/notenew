"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { databases, DATABASE_ID, COLLECTIONS, Query } from "../../lib/appwrite"
import { Plus, Check, Trash2, Calendar, Clock } from "lucide-react"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import Modal from "../../components/UI/Modal"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

const Todo = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState("all") // all, pending, completed

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TODOS, [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
      ])
      setTodos(response.documents)
    } catch (error) {
      console.error("Error fetching todos:", error)
      toast.error("Failed to load todos")
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (data) => {
    try {
      const todoData = {
        title: data.title,
        description: data.description || "",
        priority: data.priority || "medium",
        dueDate: data.dueDate || null,
        completed: false,
        userId: user.$id,
      }

      const response = await databases.createDocument(DATABASE_ID, COLLECTIONS.TODOS, "unique()", todoData)

      setTodos((prev) => [response, ...prev])
      setShowAddModal(false)
      reset()
      toast.success("Todo added successfully!")
    } catch (error) {
      console.error("Error adding todo:", error)
      toast.error("Failed to add todo")
    }
  }

  const toggleTodo = async (todoId, completed) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.TODOS, todoId, { completed: !completed })

      setTodos((prev) => prev.map((todo) => (todo.$id === todoId ? { ...todo, completed: !completed } : todo)))

      toast.success(completed ? "Todo marked as pending" : "Todo completed!")
    } catch (error) {
      console.error("Error updating todo:", error)
      toast.error("Failed to update todo")
    }
  }

  const deleteTodo = async (todoId) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.TODOS, todoId)

      setTodos((prev) => prev.filter((todo) => todo.$id !== todoId))
      toast.success("Todo deleted successfully!")
    } catch (error) {
      console.error("Error deleting todo:", error)
      toast.error("Failed to delete todo")
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed
    if (filter === "pending") return !todo.completed
    return true
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My To-Do List</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize your study tasks and goals</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Todo</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: "all", label: "All Tasks" },
          { key: "pending", label: "Pending" },
          { key: "completed", label: "Completed" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todos.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todos.filter((t) => !t.completed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {todos.filter((t) => t.completed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === "completed"
                ? "No completed tasks"
                : filter === "pending"
                  ? "No pending tasks"
                  : "No tasks yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "all"
                ? "Add your first task to get started!"
                : `Switch to another filter to see your ${filter === "completed" ? "pending" : "completed"} tasks.`}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.$id}
              className={`card p-4 transition-all duration-200 ${todo.completed ? "opacity-75" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTodo(todo.$id, todo.completed)}
                  className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-medium ${
                        todo.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {todo.title}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.$id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {todo.description && (
                    <p
                      className={`mt-1 text-sm ${
                        todo.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}

                  {todo.dueDate && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {formatDate(todo.dueDate)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Todo Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Todo" size="md">
        <form onSubmit={handleSubmit(addTodo)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              className="input-field"
              placeholder="Enter task title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="input-field"
              placeholder="Add more details (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select {...register("priority")} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input {...register("dueDate")} type="date" className="input-field" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Todo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Todo
