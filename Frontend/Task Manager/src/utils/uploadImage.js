import { API_PATHS } from "./ApiPath";
import Axiosinstance from "./Axiosinstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();

    // Append the image file to the FormData object
    formData.append("image", imageFile);

    try {
        const response = await Axiosinstance.post(API_PATHS.IMAGES.UPLOAD_IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

export default uploadImage;