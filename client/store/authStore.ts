import { create } from "zustand"

interface AuthState {
  email: string
  password: string
  firstName: string
  lastName: string
  birthDate: Date
  isAuthenticated: boolean
  isLoading: boolean
  lastLoginTime: number | null
  errorMessage: string | null
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setBirthDate: (birthDate: Date) => void
  setError: (error: string | null) => void
  clearError: () => void
  validateEmail: (email: string) => boolean
  registerUser: () => Promise<{ success: boolean; message: string }>
  loginUser: () => Promise<{ success: boolean; message: string }>
  logoutUser: () => Promise<{ success: boolean; message: string }> 
}

// Simple request cache for deduplication
const requestCache: Record<string, any> = {};

// Optimized API call with error handling
const makeApiCall = async (url: string, options: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  birthDate: new Date(),
  isAuthenticated: false,
  isLoading: false,
  lastLoginTime: null,
  errorMessage: null,

  // Optimized setters with input validation
  setEmail: (email: string) => {
    set({ email: email.trim().toLowerCase(), errorMessage: null });
  },
  
  setPassword: (password: string) => {
    set({ password, errorMessage: null });
  },
  
  setFirstName: (firstName: string) => {
    set({ firstName: firstName.trim(), errorMessage: null });
  },
  
  setLastName: (lastName: string) => {
    set({ lastName: lastName.trim(), errorMessage: null });
  },
  
  setBirthDate: (birthDate: Date) => {
    set({ birthDate, errorMessage: null });
  },

  setError: (error: string | null) => set({ errorMessage: error }),
  clearError: () => set({ errorMessage: null }),

  // Optimized email validation
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  registerUser: async () => {
    try {
      const { email, password, firstName, lastName, birthDate, validateEmail } = get();
      
      // Clear any previous errors
      set({ errorMessage: null });
      
      // Client-side validation
      if (!validateEmail(email)) {
        const error = "Please enter a valid email address";
        set({ errorMessage: error });
        return { success: false, message: error };
      }

      if (!email || !password || !firstName || !lastName) {
        const error = "Please fill in all required fields";
        set({ errorMessage: error });
        return { success: false, message: error };
      }

      if (password.length < 6) {
        const error = "Password must be at least 6 characters long";
        set({ errorMessage: error });
        return { success: false, message: error };
      }

      set({ isLoading: true });

      const formattedDate = birthDate.toISOString().split("T")[0];

      await makeApiCall(
        "http://192.168.1.7:3000/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            birthDate: formattedDate,
          }),
        }
      );

      // Clear form data on successful registration
      set({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        birthDate: new Date(),
        errorMessage: null,
      });

      return { success: true, message: "Account created successfully!" };
      
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "An error occurred during registration";
      set({ errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  loginUser: async () => {
    try {
      const { email, password, validateEmail } = get();

      // Clear any previous errors
      set({ errorMessage: null });

      if (!email || !password) {
        const error = "Please fill in all fields";
        set({ errorMessage: error });
        return { success: false, message: error };
      }

      if (!validateEmail(email)) {
        const error = "Please enter a valid email address";
        set({ errorMessage: error });
        return { success: false, message: error };
      }

      set({ isLoading: true });
      
      await makeApiCall(
        "http://192.168.1.7:3000/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      // Update auth state on successful login
      set({ 
        isAuthenticated: true,
        password: "", // Clear password from memory
        lastLoginTime: Date.now(),
        errorMessage: null,
      });

      return { success: true, message: "Login successful!" };
      
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "An error occurred during login";
      set({ errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  logoutUser: async () => {
    try {
      set({ isLoading: true });

      await makeApiCall(
        "http://192.168.1.7:3000/auth/logout",
        { method: "POST" }
      );

      // Clear all auth state
      set({
        isAuthenticated: false,
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        birthDate: new Date(),
        lastLoginTime: null,
        errorMessage: null,
      });

      return { success: true, message: "Logged out successfully" };
      
    } catch (error: any) {
      console.error("Logout error:", error);
      const errorMessage = error.message || "An error occurred during logout";
      set({ errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Optimized selectors for specific state slices to prevent unnecessary re-renders
export const useAuthEmail = () => useAuthStore((state) => state.email);
export const useAuthPassword = () => useAuthStore((state) => state.password);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.errorMessage);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthActions = () => useAuthStore((state) => ({
  setEmail: state.setEmail,
  setPassword: state.setPassword,
  setFirstName: state.setFirstName,
  setLastName: state.setLastName,
  setBirthDate: state.setBirthDate,
  registerUser: state.registerUser,
  loginUser: state.loginUser,
  logoutUser: state.logoutUser,
  clearError: state.clearError,
}));

// Performance monitoring for auth store
if (process.env.NODE_ENV === 'development') {
  useAuthStore.subscribe(
    (state) => state.isLoading,
    (isLoading, previousIsLoading) => {
      if (isLoading !== previousIsLoading) {
        console.log(`Auth loading state changed: ${previousIsLoading} -> ${isLoading}`);
      }
    }
  );
}