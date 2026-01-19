import type { UseFormRegister } from "react-hook-form"
import type { IFormValues } from "../chat/AddFriendModal"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { UserPlus } from "lucide-react"


interface SentRequestProps {
    register: UseFormRegister<IFormValues>
    loading: boolean
    searchedUsername: string
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    onBack: () => void
}

const SentFriendRequestForm = ({
    register,
    loading,
    searchedUsername,
    onSubmit,
    onBack
}: SentRequestProps) => {

    return (
        <form onSubmit={onSubmit}>
            <div className="space-y-4">
                <span className="success-message">
                    Tìm thấy <span className="font-semibold">@{searchedUsername}</span> rồi nè
                </span>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Giới thiệu</Label>
                    <Textarea
                        id="message"
                        rows={3}
                        placeholder="Chào bạn ~ có thể kết bạn được không?"
                        className="glass border-border/50 focus:border-primary/50 resize-none"
                        {...register("message")}
                    />
                </div>

                <DialogFooter>
                    <Button
                       type="button"
                       variant="outline"
                       className="flex-1 glass hover:text-destructive" 
                       onClick={onBack}
                    >
                        Quay lại
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-900 text-white hover:opacity-90"
                    >
                        {loading ? (
                            <span>Đang gửi ...</span>
                        ) : (
                            <>
                                <UserPlus className="size-4 mr-2"/> Kết bạn
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </div>
        </form>
    )
}

export default SentFriendRequestForm