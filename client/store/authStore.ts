import { create } from "zustand";
import Constants from "expo-constants";

// const { localHost } = Constants.expoConfig?.extra || {};

interface AuthState {
  email: string;
  password: string;

  firstName: string;
  lastName: string;
  birthDate: Date;
  isAuthenticated: boolean;
  isLoading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  setBirthDate: (birthDate: Date) => void;
  validateEmail: (email: string) => boolean;
  registerUser: () => Promise<{ success: boolean; message: string }>;
  loginUser: () => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  birthDate: new Date(),
  isAuthenticated: false,
  isLoading: false,
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  setBirthDate: (birthDate) => set({ birthDate }),

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  registerUser: async () => {
    try {
      const { email, password, firstName, lastName, birthDate, validateEmail } =
        get();

      if (!validateEmail(email)) {
        return {
          success: false,
          message: "Please enter a valid email address",
        };
      }

      if (!email || !password || !firstName || !lastName) {
        return {
          success: false,
          message: "Please fill in all required fields",
        };
      }

      set({ isLoading: true });

      const formattedDate = birthDate.toISOString().split("T")[0];

      // const response = await fetch(`${localHost}/auth/register`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Accept: "application/json",
      //   },
      //   body: JSON.stringify({
      //     email,
      //     password,
      //     firstName,
      //     lastName,
      //     birthDate: formattedDate,
      //   }),
      // });

      const response = await fetch(
        "http://172.20.10.2:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            birthDate: formattedDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      set({
        email: "",
        password: "",

        firstName: "",
        lastName: "",
        birthDate: new Date(),
      });

      return { success: true, message: "Account created successfully!" };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during registration",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  loginUser: async () => {
    try {
      const { email, password } = get();

      if (!email || !password) {
        return {
          success: false,
          message: "Please fill in all fields",
        };
      }

      set({ isLoading: true });

      // const response = await fetch(`${localHost}/auth/login`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email,
      //     password,
      //   }),
      // });

      const response = await fetch("http://172.20.10.2:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      set({
        isAuthenticated: true,
        password: "",
      });

      return { success: true, message: "Login successful!" };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during login",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  //   logoutUser: async () => {
  //     try {
  //       const response = await fetch(`${localHost}/auth/logout`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       const data = await response.json();

  //       if (!response.ok) {
  //         throw new Error(data.error || "Logout failed");
  //       }

  //       set({
  //         isAuthenticated: false,
  //         email: "",
  //         password: "",
  //         firstName: "",
  //         lastName: "",
  //         birthDate: new Date(),
  //       });

  //       return { success: true, message: "Logged out successfully" };
  //     } catch (error: any) {
  //       console.error("Logout error:", error);
  //       return {
  //         success: false,
  //         message: error.message || "An error occurred during logout",
  //       };
  //     }
  //   },
  // }));

  logoutUser: async () => {
    try {
      const response = await fetch("http://192.168.1.3:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Logout failed");
      }

      set({
        isAuthenticated: false,
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        birthDate: new Date(),
      });

      return { success: true, message: "Logged out successfully" };
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: error.message || "An error occurred during logout",
      };
    }
  },
}));
