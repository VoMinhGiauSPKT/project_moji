import jwt from "jsonwebtoken"

//model
import User from "../models/User.js"

// authorization - xác minh user là ai
export const protectedRoute = (req, res, next) => {
    // next là 1 hàm callback dùng trong middleware của express 
    // khi gọi next thì express sẽ hiểu là chuyển tiếp luồng xử lí sang bước kế tiếp
    try {
        // lấy accesstoken từ header 
        const authHeader = req.headers["authorization"] // để lấy authoriation của header
        const token = authHeader && authHeader.split(" ")[1] // kiểm tra có tồn tại authoriation không nếu có thì lấy token
        // quy ước chung để lấy accesstoken khi làm việc với API
        // vì ( authoriation: Bearer <token> ) nên khi lấy ra thì thành mảng ["Bearer","<token>"] nên ta lấy index = 1

        if (!token) {
            return res
                .status(401)
                .json({message: "không tìm thấy accesstoken"})
        }


        // xác minh coi accesstoken có hợp lệ hay không
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                console.error(err);
                
                return res
                    .status(403)
                    .json({message: "access token hết hạn hoặc không đúng"})
            }

            // nếu token hợp lệ tìm user tương ứng trong DB 
            const user = await User.findById(decodedUser.userId).select("-hashedPassword")
            // select ở đây để lấy thông tin user nhưng trừ mật khẩu ra

            if (!user) {
                return res
                    .status(404)
                    .json({message: "người dùng không tồn tại"})
            }

            // nếu tìm thấy thì gắn thông tin user vào request để cái API khác có thể tận dụng luôn mà ko cần chi vấn lại
            req.user = user;
            next();

        })

    } catch (error) {
        console.error("lỗi khi xác minh JWT trong authMiddleware", error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"});
    }
}