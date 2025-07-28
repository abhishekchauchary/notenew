"use client"
import { Routes, Route } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/Auth/ProtectedRoute"
import LoadingSpinner from "./components/UI/LoadingSpinner"

// Pages
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import Home from "./pages/Home/Home"
import Upload from "./pages/Upload/Upload"
import Profile from "./pages/Profile/Profile"
import NoteDetail from "./pages/NoteDetail/NoteDetail"
import Todo from "./pages/Todo/Todo"
import Explore from "./pages/Explore/Explore"
import NotFound from "./pages/NotFound/NotFound"

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <Upload />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/:userId?"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/note/:noteId"
        element={
          <ProtectedRoute>
            <Layout>
              <NoteDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/todo"
        element={
          <ProtectedRoute>
            <Layout>
              <Todo />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <Layout>
              <Explore />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
