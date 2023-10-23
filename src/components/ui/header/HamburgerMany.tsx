import {auth} from "../../../firebase";
import styled from "./HamburgerMany.module.css";
import {Link} from "react-router-dom";

type Props = {
  admin: any;
  setManyList: any;
};

const HamburgerMany: React.FC<Props> = (props) => {
  const {admin, setManyList} = props;
  return (
    <>
      <ul className={styled.manyList}>
        {admin && (
          <li>
            <Link to="/shift" onClick={() => setManyList(false)}>
              シフト管理
            </Link>
          </li>
        )}
        <li>
          <Link to="/" onClick={() => setManyList(false)}>
            シフト提出
          </Link>
        </li>
        <li>
          <Link to="/profile" onClick={() => setManyList(false)}>
            プロフィール設定
          </Link>
        </li>
        <li>
          <Link to="/setting" onClick={() => setManyList(false)}>
            通知設定
          </Link>
        </li>
        <li>
          <Link to="" onClick={() => auth.signOut()}>
            ログアウト
          </Link>
        </li>
      </ul>
    </>
  );
};

export default HamburgerMany;
