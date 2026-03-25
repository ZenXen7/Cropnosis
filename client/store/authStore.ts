import { create } from "zustand"
import { apiService } from "../lib/api"

interface AuthState {
  email: string
  password: string
  firstName: string
  lastName: string
  birthDate: Date
  userId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setBirthDate: (birthDate: Date) => void
  validateEmail: (email: string) => boolean
  registerUser: () => Promise<{ success: boolean; message: string }>
  loginUser: () => Promise<{ success: boolean; message: string }>
  logoutUser: () => Promise<{ success: boolean; message: string }> 
}

export const useAuthStore = create<AuthState>((set, get) => ({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  birthDate: new Date(),
  userId: null,
  isAuthenticated: false,
  isLoading: false,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setBirthDate: (birthDate) => set({ birthDate }),

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  registerUser: async () => {
    try {
      const { email, password, firstName, lastName, birthDate, validateEmail } = get()
      
      if (!validateEmail(email)) {
        return {
          success: false,
          message: "Please enter a valid email address",
        }
      }

      if (!email || !password || !firstName || !lastName) {
        return {
          success: false,
          message: "Please fill in all required fields",
        }
      }

      set({ isLoading: true })

      const formattedDate = birthDate.toISOString().split("T")[0]

      // Use the new API service
      const result = await apiService.register({
        email,
        password,
        firstName,
        lastName,
        birthDate: formattedDate,
      })

      if (result.success) {
        set({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          birthDate: new Date(),
        })
        return { success: true, message: "Account created successfully!" }
      } else {
        throw new Error(result.error || "Registration failed")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: error.message || "An error occurred during registration",
      }
    } finally {
      set({ isLoading: false })
    }
  },

  loginUser: async () => {
    try {
      const { email, password } = get()

      if (!email || !password) {
        return {
          success: false,
          message: "Please fill in all fields",
        }
      }

      set({ isLoading: true })

      // Use the new API service
      const result = await apiService.login({ email, password })

      if (result.success) {
        const loggedInUserId = result.data?.user?.id || null
        const loggedInFirstName = result.data?.user?.firstName || ""
        const loggedInLastName = result.data?.user?.lastName || ""
        set({ 
          isAuthenticated: true,
          userId: loggedInUserId,
          firstName: loggedInFirstName,
          lastName: loggedInLastName,
          email: result.data?.user?.email || get().email,
          password: "" 
        })
        return { success: true, message: "Login successful!" }
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.message || "An error occurred during login",
      }
    } finally {
      set({ isLoading: false })
    }
  },

  logoutUser: async () => {
    try {
      // Use the new API service
      const result = await apiService.logout();

      if (result.success) {
        set({
          isAuthenticated: false,
          userId: null,
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          birthDate: new Date(),
        });
        return { success: true, message: "Logged out successfully" };
      } else {
        throw new Error(result.error || "Logout failed");
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during logout",
      };
    }
  },
}));