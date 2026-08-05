export function saveToStorage(key, value){
    localStorage.setItem(
        key, 
        JSON.stringify(value)
    );
}

export function getFromStorage(key){

    const item = localStorage.getItem(key);

    if (!item || item === "undefined") {
        return null;
    }

    try {
        return JSON.parse(item);
    } catch (error) {
        console.error(`Failed to parse "${key}" from localStorage`, error);

        localStorage.removeItem(key);

        return null;
    }
}

export function removeFromStorage(key){
    localStorage.removeItem(key);
}