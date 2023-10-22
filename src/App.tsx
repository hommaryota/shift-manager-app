import {useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {selectUser, login, logout} from "./features/userSlice";
import {auth} from "./firebase";
import Auth from "./components/common/Auth";

import Layout from "./components/common/Layout";
import {onAuthStateChanged} from "firebase/auth";

const App = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            displayName: authUser.displayName,
            phoneNumber: authUser.phoneNumber,
            email: authUser.email,
          })
        );
      } else {
        dispatch(logout());
      }
    });
    return () => {
      unSub();
    };
  }, [dispatch]);

  return <>{user.uid ? <Layout /> : <Auth />}</>;
};

export default App;
