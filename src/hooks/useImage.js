function useImage(image) {
    return {
        imageUrl: image || null,
        isLoading: false
    };
}

export default useImage;