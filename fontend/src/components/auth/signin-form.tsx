import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useNavigate } from "react-router"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// zod sẽ lo phần kiểm tra dữ liệu còn react-hook-form lo phần quản lí trạng thái và sự kiện của form
import {z} from "zod";
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod" // giúp kết nối cái zod với react-hook-form

import { useAuthStore } from "@/stores/useAuthStore"

const signInSchema = z.object({
  username: z.string().min(1,'Tên đăng nhập ít nhất 3 ký tự'),
  password: z.string().min(6,"Mật khẩu ít nhất 6 ký tự")
})

type SignInFormValues = z.infer<typeof signInSchema>

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

    const {signIn} = useAuthStore();

    const navigate = useNavigate()

    // hook giúp xử lí logic của form
    // lấy dữ liệu của input 
    // kiểm tra xem input có hợp lệ không
    // gửi form
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignInFormValues>({
      resolver: zodResolver(signInSchema) // kết nói với useForm với signUpSchema
    });
    
    const onSubmit = async (data: SignInFormValues) => {
      const {username, password} = data;
      // gọi api từ BE để signup
      await signIn(username, password);
      navigate("/");
    }
    return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>

                <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                <p className="text-muted-foreground text-balance">
                  Đăng nhập vào tài khoản Moji của bạn
                </p>
              </div>
              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input type="text" id="username" placeholder="moji" {...register("username")}/>
                {/* todo: error message */}
                {errors.username && (
                  <p className="text-destructive text-sm">{errors.username.message}</p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật Khẩu
                </Label>
                <Input type="password" id="password" {...register("password")}/>
                {/* todo: error message */}
                {errors.password && (
                    <p className="text-destructive text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* nút đăng nhập */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Đăng nhập
              </Button>

              <div className="text-center text-sm">
                Chưa có tài khoản? {" "} 
                <a href="/signup" className="uderline underline-offset-4">Đăng ký</a>
              </div>

            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-sx text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoảng dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a> của chúng tôi. 
      </div>
    </div>
  )
}