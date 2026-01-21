import api from "@/lib/axios";

export const userService = {
    UploadAvatar: async (formData: FormData) => {
        const res = await api.post("/users/uploadAvatar", formData,{
            headers: {"Content-type":"multipart/form-data"},
        })

        if(res.status === 400){
            throw new Error(res.data.message)
        }

        return res.data
    }
}