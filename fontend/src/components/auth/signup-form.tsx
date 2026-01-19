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

const signUpSchema = z.object({
  firstname: z.string().min(1,'Tên bắt buộc phải có'),
  lastname: z.string().min(1,'Họ bắt buộc phải có'),
  username: z.string().min(1,'Tên đăng nhập ít nhất 3 ký tự'),
  email: z.email("email không hợp lệ"),
  password: z.string().min(6,"Mật khẩu ít nhất 6 ký tự")
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const {signUp} = useAuthStore();
  const navigate = useNavigate();

  // hook giúp xử lí logic của form
  // lấy dữ liệu của input 
  // kiểm tra xem input có hợp lệ không
  // gửi form
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema) // kết nói với useForm với signUpSchema
  });

  const onSubmit = async (data: SignUpFormValues) => {
    // gọi api từ BE để signup
    const {firstname, lastname, username, email, password} = data

    await signUp(username, password, email, firstname, lastname);

    navigate("/signin");
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-3 md:p-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" className="h-8"/>
                </a>

                <h1 className="text-lg font-bold">Tạo tài khoản Moji</h1>
                <p className="text-muted-foreground text-xs">
                  chào mừng bạn hãy đăng kí để bắt đầu
                </p>
              </div>

              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="lastname" className="block text-xs mb-1">
                    Họ
                  </Label>
                  <Input type="text" id="lastname" className="h-8" {...register("lastname")}/>
                  {errors.lastname && (
                    <p className="error-message">{errors.lastname.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="firstname" className="block text-xs mb-1">
                    Tên
                  </Label>
                  <Input type="text" id="firstname" className="h-8" {...register("firstname")}/>
                  {errors.firstname && (
                    <p className="error-message">{errors.firstname.message}</p>
                  )}
                </div>
              </div>

              {/* username */}
              <div>
                <Label htmlFor="username" className="block text-xs mb-1">
                  Tên đăng nhập
                </Label>
                <Input type="text" id="username" placeholder="moji" className="h-8" {...register("username")}/>
                {errors.username && (
                  <p className="text-destructive text-xs">{errors.username.message}</p>
                )}
              </div>

              {/* email */}
              <div>
                <Label htmlFor="email" className="block text-xs mb-1">
                  Email
                </Label>
                <Input type="email" id="email" placeholder="m@gmail.com" className="h-8" {...register("email")}/>
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email.message}</p>
                )}
              </div>

              {/* password */}
              <div>
                <Label htmlFor="password" className="block text-xs mb-1">
                  Mật Khẩu
                </Label>
                <Input type="password" id="password" className="h-8" {...register("password")}/>
                {errors.password && (
                    <p className="text-destructive text-xs">{errors.password.message}</p>
                )}
              </div>

              {/* nút đăng kí */}
              <Button type="submit" className="w-full h-8" disabled={isSubmitting}>
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản? {" "} 
                <a href="/signin" className="underline underline-offset-4">Đăng nhập</a>
              </div>

            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
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
