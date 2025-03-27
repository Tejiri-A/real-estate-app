import { createContext, ReactNode, useContext } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
  }

interface GlobalContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refetch: (newParams?: Record<string, string | number>) => Promise<void>;
}
const GlobalContext  = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const { data: user, loading, refetch } = useAppwrite({
        fn: getCurrentUser,
    }) || { data: null, loading: false, refetch: async () => {} };

    // fallback to Email of ID if name is empty
    const userWithFallback = user? { ...user, name: user.name || user.email } : null;

    const isLoggedIn = !!userWithFallback;
    // console.log(JSON.stringify(userWithFallback, null, 2))
    return (
        <GlobalContext.Provider value={{ isLoggedIn, userWithFallback, loading, refetch }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext)

    if(!context){
        throw new Error('useGlobalContext must be used within GlobalProvider')
    }

    return context
}

export default GlobalProvider;