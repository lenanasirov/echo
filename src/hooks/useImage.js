import { useEffect, useState } from "react";
import { getImage } from "../utils/imageStorage";

function useImage(image) {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        let objectUrl;

        const loadImage = async () => {
            if (!image) {
                return;
            }

            if (typeof image === "string") {
                setImageUrl(image);
                return;
            }

            if (image.type !== "indexeddb") {
                return;
            }

            const storedImage  = await getImage(image.id);

            if (!storedImage) {
                return;
            }

            objectUrl = URL.createObjectURL(storedImage);

            setImageUrl(objectUrl);
        };

        loadImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [image]);

    return imageUrl;
}

export default useImage;