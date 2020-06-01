export function defined<T>(t: T | null | undefined): t is T {
    return t != null;
}