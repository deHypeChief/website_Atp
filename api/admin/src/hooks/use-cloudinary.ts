import { toast } from '@/hooks/use-toast';
import { useError } from './use-error';
import api from '@/lib/axios';

export const useCloudinary = () => {
    const { error } = useError()

    async function uploadFile(file: File | null) {
        if (!file) {
            toast({
                variant: "destructive",
                title: "Choose an image first",
            });
            throw new Error("No file selected.");
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await api.post('/uploads/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const imageUrl = res.data.imageUrl;
            toast({
                variant: "default",
                title: "Image uploaded",
            });
            return imageUrl;
        } catch (err: any) {
            error(err, "Error uploading image")  // Throw the error so it can be handled upstream
        }
    }

    return { uploadFile };
};
