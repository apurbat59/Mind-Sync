"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Trash2, Calendar, Mail, AlertTriangle } from "lucide-react"

interface UserAccount {
  id: string
  name: string
  email: string
  createdAt: string
  isVerified: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const existingUsers = JSON.parse(localStorage.getItem("mindsync-users") || "[]")
    setUsers(existingUsers)
  }

  const deleteUser = (userId: string) => {
    const existingUsers = JSON.parse(localStorage.getItem("mindsync-users") || "[]")
    const updatedUsers = existingUsers.filter((user: UserAccount) => user.id !== userId)
    localStorage.setItem("mindsync-users", JSON.stringify(updatedUsers))

    // Also clean up user-specific data
    const userToDelete = existingUsers.find((user: UserAccount) => user.id === userId)
    if (userToDelete) {
      localStorage.removeItem(`emails-${userToDelete.email}`)
      localStorage.removeItem(`gmail-connected-${userToDelete.email}`)
      localStorage.removeItem(`gmail-token-${userToDelete.email}`)
      localStorage.removeItem(`gmail-refresh-token-${userToDelete.email}`)
      localStorage.removeItem(`gmail-token-expires-${userToDelete.email}`)
    }

    loadUsers()
    setShowConfirmDelete(null)
  }

  const clearAllUsers = () => {
    localStorage.removeItem("mindsync-users")
    localStorage.removeItem("mindsync-memories")
    // Clear all user-specific data
    users.forEach((user) => {
      localStorage.removeItem(`emails-${user.email}`)
      localStorage.removeItem(`gmail-connected-${user.email}`)
      localStorage.removeItem(`gmail-token-${user.email}`)
      localStorage.removeItem(`gmail-refresh-token-${user.email}`)
      localStorage.removeItem(`gmail-token-expires-${user.email}`)
    })
    loadUsers()
  }

  if (users.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-900">
            <AlertTriangle className="h-5 w-5 mr-2" />
            No User Accounts
          </CardTitle>
          <CardDescription className="text-yellow-700">
            No user accounts have been created yet. Users must sign up before they can sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <User className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-yellow-800 font-medium">Create your first account</p>
            <p className="text-yellow-600 text-sm">Click "Get Started" to sign up and create an account</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-900">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            User Accounts ({users.length})
          </div>
          <Button
            onClick={clearAllUsers}
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Registered user accounts. Users must sign up before they can sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-blue-900">{user.name}</h4>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                    {user.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showConfirmDelete === user.id ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => deleteUser(user.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => setShowConfirmDelete(null)}
                      size="sm"
                      variant="outline"
                      className="border-gray-200 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowConfirmDelete(user.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Authentication Rules:</strong>
          </p>
          <ul className="text-xs text-gray-500 mt-1 space-y-1">
            <li>• Users must sign up before they can sign in</li>
            <li>• Each email address can only have one account</li>
            <li>• Sign in requires exact email and password match</li>
            <li>• No account = sign in will fail with clear error message</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
