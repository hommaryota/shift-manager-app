import {useEffect, useMemo, useState} from "react";
import styles from "./Layout.module.css";
import Header from "../ui/header/Header";
import ShiftCalendar from "../pages/Top/ShiftCalendar";

import {Routes, Route} from "react-router-dom";
import {Setting} from "../Setting";
import Profile from "../pages/Profile/Profile";
import {auth, db} from "../../firebase";
import {collection, doc, getDoc} from "firebase/firestore";
import ShiftManager from "../pages/Manager/ShiftManager";

const Layout = () => {
  const [lastName, setLastName] = useState("");
  const [admin, setAdmin] = useState(false);
  const [users, setUsers] = useState([]);

  // ログインしてるユーザーの苗字を取得する処理
  const currentLastName = useMemo(() => {
    const authCurrentUserName = auth.currentUser?.displayName;
    const currentLastName = authCurrentUserName?.split(" ")[0];
    return currentLastName;
  }, [lastName]);

  // ログインしているユーザーが管理者だった場合の処理
  useEffect(() => {
    (async () => {
      const adminColRef = await collection(db, "admin");
      const adminDocRef = await doc(adminColRef, auth.currentUser?.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.data()) {
        return;
      }
      setAdmin(true);

      const docUserRef = doc(adminColRef, "users");
      const docUserSnap = await getDoc(docUserRef);
      setUsers(docUserSnap.data()?.user);
    })();
  }, []);

  return (
    <>
      <Header currentLastName={currentLastName} admin={admin} />
      <div className={styles.container}>
        <Routes>
          <Route path="/" element={<ShiftCalendar text="シフト提出画面" />} />
          <Route
            path="/profile"
            element={<Profile text="プロフィール設定画面" setLastName={setLastName} />}
          />
          <Route path="/setting" element={<Setting text="通知設定画面" />} />
          {admin && (
            <Route
              path="/shift"
              element={<ShiftManager text="シフト管理画面" users={users} />}
            />
          )}
        </Routes>
      </div>
    </>
  );
};

export default Layout;
