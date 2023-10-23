import {Route, Routes} from "react-router-dom";
import ShiftCalendar from "./Top/ShiftCalendar";
import Profile from "./Profile/Profile";
import ShiftManager from "./Manager/ShiftManager";
import ErrorPage from "./Error/Error-page";
import {Setting} from "../components/Setting";

type Props = {
  admin: boolean;
  users: any;
};

const AppRoutes: React.FC<Props> = (props) => {
  const {admin, users} = props;
  return (
    <Routes>
      <Route path="/" element={<ShiftCalendar text="シフト提出画面" />} />
      <Route path="/profile" element={<Profile text="プロフィール設定画面" />} />
      <Route path="/setting" element={<Setting text="通知設定画面" />} />
      {admin && (
        <Route
          path="/shift"
          element={<ShiftManager text="シフト管理画面" users={users} />}
        />
      )}
      <Route path="*" element={<ErrorPage text="Error" />} />
    </Routes>
  );
};

export default AppRoutes;
