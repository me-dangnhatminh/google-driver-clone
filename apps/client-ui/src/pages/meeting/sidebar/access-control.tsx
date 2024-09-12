import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Switch } from "@components/ui/switch";

function AccessControl() {
  return (
    <div className="w-full h-full flex flex-col space-y-4 p-4 text-sm text-muted font-normal select-none">
      <div>
        <div className="text-lg">Bộ điều khiển của người tổ chức</div>
        <div className="text-gray-500">
          Sử dụng các chế độ cài đặt dành cho người tổ chức này để kiểm soát
          cuộc họp của bạn. Chỉ người tổ chức có quyền truy cập các công cụ điều
          khiển này.
        </div>
      </div>
      <div className="space-y-2">
        <div>Quyền cuộc họp</div>
        <div className="text-gray-500">
          Kiểm soát người tham dự trong cuộc họp của bạn. Chỉ người tổ chức mới
          có thể thực hiện các thao tác này.
        </div>
        <div className="flex items-center space-x-2 ">
          <Label htmlFor="wait-host" className="text-sm font-normal">
            Người tổ chức phải tham gia trước những người khác
          </Label>
          <Switch id="wait-host" />
        </div>
        <div>
          <RadioGroup defaultValue="open" className="space-y-2">
            <div className="space-x-2">
              <RadioGroupItem value="open" id="open" className="bg-muted" />
              <Label htmlFor="open" className="text-sm font-normal">
                <span>Mở</span>
                <div className="text-gray-500">
                  Kiểm soát người tham dự trong cuộc họp của bạn. Chỉ người tổ
                  chức mới có thể thực hiện các thao tác này.
                </div>
              </Label>
            </div>
            <div className="space-x-2">
              <RadioGroupItem value="close" id="close" className="bg-muted" />
              <Label htmlFor="close" className="text-sm font-normal">
                <span>Đáng tin cậy</span>
                <div className="text-gray-500">
                  Chỉ người tổ chức mới có thể thêm người tham dự vào cuộc họp.
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

export default AccessControl;
