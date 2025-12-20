import bcrypt from "bcrypt";

// model
import User from "../models/User.js"
import Session from "../models/Session.js";

// access token
import jwt from "jsonwebtoken"

// refresh token
import crypt from "crypto"

const ACCESS_TOKEN_TTL = "30m"; // thường dưới 15m nhưng mà trong môi trường Dev thì để cao để dễ test API
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày theo mili giây

// đăng kí
export const signUp = async (req, res) => {
    try{
        const {username, password, email, firstName, lastName} = req.body; 
        if(!username || !password || !email || !firstName || !lastName){
            return res
                .status(400)
                .json({
                    message: "không thể thiếu username, password, email, firstName, lastName"
                });
        }

        // kiểm tra có tồn tại chưa 
        const duplicate = await User.findOne({username});

        if (duplicate) {
            return res
                .status(409)
                .json({
                    message: "username đã tồn tại"
                })
        }

        // mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10) // salt = 10 tức là bcrypt sẽ mã hóa đi mã hóa lại 2 mũ 10 lần

        // tạo user mới
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`
        });

        // return
        return res.sendStatus(204);

    } catch (error) {
        console.error("lỗi khi gọi signUp: ",error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"});
    }
};   

// đăng nhập
export const signIn = async (req, res) => {
    try {
        // lấy inputs
        const {username, password} = req.body;

        if (!username || !password){
            return res
                .status(400)
                .json({message: "thiếu usernam hoặc password"})
        }

        // lấy hashedPassword trong db để so sánh với password input
        const user = await User.findOne({username});

        if (!user) {
            return res
                .status(401)
                .json({message: "username hoặc password không chính xác"});
        }

        // kiểm tra password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if (!passwordCorrect) {
            return res
                .status(401)
                .json({message: "username hoặc password không chính xác"});
        }

        // nếu khớp thì tạo access token với JWT
        // trước cần có access token secret có thể lấy bất cứ giá trị nào mình muốn 
        // vào terminal gõ "node" để mở môi trường nodejs gõ require('crypto').randomBytes(64).toString('hex') để lấy một đoạn mã mà thư viện crypto có sẵn trong nodejs
        // jwt.sign() nhận vào ba tham số 
        // tham số thứ nhất là thông tin Dev muốn đưa vô
        // tham số thứ hai là câu thần chú (access token secret)
        // tham số thứ ba là thời gian accesstoken có thể sống thường dưới 15p ({expiresIn: "15m"})
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL})

        // tạo refresh token
        const refreshTokon = crypt.randomBytes(64).toString("hex");

        // tạo session mới để lưu refresh token
        // tạo sao phải lưu refresh token mà ko lưu luôn access token vì
        // access token có thời gian sống rất ngắn không cần lưu
        // refresh token sống lâu hơn nếu như ta lưu vào db thì bị Hacker tấn công chỉ cần xóa nó khổi db
        // nếu không lưu nó trong db mà bọc trong jwt và gửi trong cookie khi hacker tấn công 
        // thì ta không có cách nào ngăn chặn nó hết chỉ có thể để nó tự hết thời gian 
        await Session.create({
            userId: user._id,
            refreshToken: refreshTokon,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        })

        // trả refresh token về trong cookie
        res.cookie("refreshToken", refreshTokon, {
            httpOnly: true, // không thể truy cập qua js
            secure: true, // đảm bảo chỉ gửi qua HTTPS
            sameSite: "none", // cho phép BE và FE chạy trên hay domain khác nhau
            maxAge: REFRESH_TOKEN_TTL,
        })

        // trả access token về trong res
        return res
            .status(200)
            .json({message: `User ${user.displayName} đã logged in`, accessToken})

    } catch (error) {
        console.error("lỗi khi gọi signIn: ",error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"});
    }
};

// đăng xuất
export const signOut = async (req, res) => {
    try{
        // lấy refresh token từ cookie
        // hoạt động được nhờ thư viện cookie parser nếu không có thì nó không đọc được và nó sẽ luôn trống (null)
        const token =req.cookies?.refreshToken

        if (token) {
            // xóa refresh token trong session
            await Session.deleteOne({refreshToken: token});

            // xóa cookie trên trình duyệt của client
            res.clearCookie("refreshToken")
        }
        return res.sendStatus(204);

    } catch (error) {
        console.error("lỗi khi gọi signOut: ",error)
        return res
            .status(500)
            .json({message: "lỗi hệ thống"});
    }
};

// tạo accesstoken mới từ refreshtoken
export const refreshToken = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if(!token){
            return res
                .status(401)
                .json({message: "token không tồn tại"})
        }

        // so sánh refresh token trong db
        const session = await Session.findOne({refreshToken: token});
        if (!session){
            return res
                .status(403)
                .json({message: "token không hợp lệ hoặc hết hạn"});
        }

        // kiểm tra hết hạn chưa
        if(session.expiresAt < new Date()){
            return res
                .status(403)
                .json({message: "token đã hết hạn"})
        }

        // tạo access token mới
        const accessToken = jwt.sign({
            userId: session.userId,

        },process.env.ACCESS_TOKEN_SECRET,{expiresIn: ACCESS_TOKEN_TTL});

        // return accesstoken mới
        return res
            .status(200)
            .json({accessToken: accessToken})

    } catch (error) {
        console.error("Lỗi khi gọi refresh token", error)
        return res
            .status(500)
            .json({message: "Lỗi hệ thống"})
    }
};