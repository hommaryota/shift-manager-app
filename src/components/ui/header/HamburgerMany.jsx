import {auth} from "../../../firebase";
import styled from "./HamburgerMany.module.css";

import {Link} from "react-router-dom";

const HamburgerMany = (props) => {
  return (
    <>
      <ul className={styled.manyList}>
        {props.admin && (
          <li>
            <Link to="/shift" onClick={() => props.setManyList(false)}>
              シフト管理
            </Link>
          </li>
        )}
        <li>
          <Link to="/" onClick={() => props.setManyList(false)}>
            シフト提出
          </Link>
        </li>
        <li>
          <Link to="/profile" onClick={() => props.setManyList(false)}>
            プロフィール設定
          </Link>
        </li>
        <li>
          <Link to="/setting" onClick={() => props.setManyList(false)}>
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
