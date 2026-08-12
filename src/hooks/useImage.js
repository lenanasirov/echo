import { useEffect, useState } from "react";
import { getImage } from "../utils/imageStorage";

function useImage(image) {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let objectUrl;

        const loadImage = async () => {
            if (!image) {
                setIsLoading(false);
                return;
            }

            if (typeof image === "string") {
                setImageUrl(image);
                setIsLoading(false);
                return;
            }

            if (image.type !== "indexeddb") {
                setIsLoading(false);
                return;
            }

            const storedImage  = await getImage(image.id);

            if (!storedImage) {
                setIsLoading(false);
                return;
            }

            objectUrl = URL.createObjectURL(storedImage);

            setImageUrl(objectUrl);
            setIsLoading(false);
        };

        loadImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [image]);

    return { imageUrl, isLoading };
}

export default useImage;