import {useEffect, useState} from "react";
import styles from "./Layout.module.css";
import Header from "../ui/header/Header";
import {auth, db} from "../../firebase";
import {collection, doc, getDoc} from "firebase/firestore";
import AppRoutes from "../../routes";

const Layout: React.FC = () => {
  const [admin, setAdmin] = useState(false);
  const [users, setUsers] = useState([]);

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
      <Header admin={admin} />
      <div className={styles.container}>
        <AppRoutes admin={admin} users={users} />
      </div>
    </>
  );
};

export default Layout;
