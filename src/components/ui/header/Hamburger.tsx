import {useSelector} from "react-redux";
import styled from "./Hamburger.module.css";
import {useEffect, useRef} from "react";
import {selectUser} from "../../../features/userSlice";

type Props = {
  setManyList: any;
  manyList: any;
};

const Hamburger: React.FC<Props> = (props) => {
  const {setManyList, manyList} = props;
  const user = useSelector(selectUser);
  const insideRef = useRef(null);
  useEffect(() => {
    //対象の要素を取得
    const el: any = insideRef.current;
    //対象の要素がなければ何もしない
    if (!el) return;
    //クリックした時に実行する関数
    const handleClickOutside = (e: any) => {
      if (el?.contains(e.target)) {
        //ここに内側をクリックしたときの処理
        setManyList((prevState: any) => !prevState);
      } else if (!el?.contains(e.target) && manyList) {
        //ここに外側をクリックしたときの処理
        setManyList(false);
      }
    };
    //クリックイベントを設定
    document.addEventListener("click", handleClickOutside);

    return () => {
      //コンポーネントがアンマウント、再レンダリングされたときにクリックイベントを削除
      document.removeEventListener("click", handleClickOutside);
    };
  }, [manyList]);

  return (
    <button className={styled.many} ref={insideRef}>
      {user.displayName}
    </button>
  );
};

export default Hamburger;
