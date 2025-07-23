/**
 * Creates a function wrapper for error handling, execution time calculation,
 * and logging the function's name.
 *
 * @template T The type of the function being wrapped.
 * @param {T} func The function to wrap.
 * @returns {T} The wrapped function with added error handling and timing.
 */
export default function call<T extends (...args: any[]) => any | void>(func: T): T {
    return (function(...args: Parameters<T>): ReturnType<T> | undefined {
        const funcName = func.name || 'anonymousFunction';
        console.log(`Executing function: ${funcName}`);

        const startTime = performance.now(); 

        try {
            const result = func(...args);
            return result as ReturnType<T>; 
        } catch (error: any) { 
            console.error(`Error in function '${funcName}':`, error);
            return undefined; 
        } finally {
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            console.log(`Function '${funcName}' took ${executionTime.toFixed(4)} milliseconds to execute.`);
        }
    }) as T;
}

