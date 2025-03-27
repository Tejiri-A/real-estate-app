import { Alert } from "react-native";
import { useEffect, useState, useCallback } from "react";

// Interface for the options passed to the `useAppwrite` hook
interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
    fn: (params: P) => Promise<T>; // Function to fetch data
    params?: P; // Optional parameters for the fetch function
    skip?: boolean; // Whether to skip the initial fetch
}

// Interface for the return value of the `useAppwrite` hook
interface UseAppwriteReturn<T, P> {
    data: T | null; // The fetched data
    loading: boolean; // Loading state
    error: string | null; // Error message, if any
    refetch: (newParams: P) => Promise<void>; // Function to refetch data with new parameters
}

// Custom hook for handling API calls with Appwrite
export const useAppwrite = <T, P extends Record<string, string | number>>({
    fn,
    params = {} as P,
    skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null); // State for storing fetched data
    const [loading, setLoading] = useState(!skip); // State for tracking loading status
    const [error, setError] = useState<string | null>(null); // State for storing error messages

    // Function to fetch data, wrapped in useCallback to avoid unnecessary re-creations
    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true); // Set loading to true before fetching
            setError(null); // Reset error state

            try {
                const result = await fn(fetchParams); // Call the provided fetch function
                setData(result); // Update data state with the result
            } catch (err: unknown) {
                // Handle errors and set error state
                const errorMessage =
                    err instanceof Error ? err.message : "An unknown error occurred";
                setError(errorMessage);
                Alert.alert("Error", errorMessage); // Show an alert with the error message
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        },
        [fn] // Dependency array ensures the function is recreated only when `fn` changes
    );

    // useEffect to handle the initial fetch when the component mounts
    useEffect(() => {
        if (!skip) {
            fetchData(params); // Fetch data if `skip` is false
        }
    }, []); // Empty dependency array ensures this runs only once

    // Function to refetch data with new parameters
    const refetch = async (newParams: P) => await fetchData(newParams);

    // Return the state and refetch function
    return { data, loading, error, refetch };
};
