import { Client, Account, Databases, Storage, Query } from "appwrite"

const client = new Client()

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite Endpoint
  .setProject("your-project-id") // Your project ID

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export const DATABASE_ID = "your-database-id"
export const COLLECTIONS = {
  NOTES: "notes",
  TODOS: "todos",
  COMMENTS: "comments",
  LIKES: "likes",
  FOLLOWS: "follows",
  USERS: "users",
}

export const BUCKET_ID = "your-bucket-id"

export { Query, client }
