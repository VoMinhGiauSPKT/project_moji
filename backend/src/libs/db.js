import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGOBD_CONNECTIONSTRING);
        console.log("liên kết với cơ sở dữ liệu thành công")
    } catch (error) {
        console.log("lỗi liên kết với cơ sở dữ liệu: ", error)
        // nếu lỗi kết nối thì dừng chương trình luôn
        process.exit(1)
    }
} 