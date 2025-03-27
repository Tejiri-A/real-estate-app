import { createContext, ReactNode, useContext } from "react";
import { useAppwrite } from "./useAppwrite";
import { avatar, getCurrentUser } from "./appwrite";



interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

interface GlobalContextType {
    isLoggedIn: boolean; // Indicates if the user is logged in
    user: User | null; // The current user's details or null if not logged in
    loading: boolean; // Indicates if the user data is being loaded
    refetch: (newParams?: Record<string, string | number>) => Promise<void>; // Function to refetch user data
}

// Create a context for global state management
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    // Use a custom hook to fetch the current user data
    const {
        data: user,
        loading,
        refetch,
    } = useAppwrite({
        fn: getCurrentUser,
    }) || {
        data: null, // Default to null if no user data is available
        loading: false, // Default loading state
        refetch: async (newParams?: Record<string, string | number>) =>
            Promise.resolve(), // Default refetch function
    };

    // Fallback to using email or ID if the user's name is empty
    const userWithFallback = user
        ? { ...user, name: user.name || user.email, avatar: user.avatar || '' }
        : null;
      
    // Determine if the user is logged in
    const isLoggedIn = !!user;   

    console.log(JSON.stringify(user, null, 2)); // Log the user data for debugging
    
    
    return (
        // Provide the global context to child components
        <GlobalContext.Provider
            value={{ isLoggedIn, user, loading, refetch } }
        >
            {children}
        </GlobalContext.Provider>
    );
};

// Custom hook to access the global context
export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);

    // Throw an error if the hook is used outside of the GlobalProvider
    if (!context) {
        throw new Error("useGlobalContext must be used within GlobalProvider");
    }

    return context;
};

export default GlobalProvider;

