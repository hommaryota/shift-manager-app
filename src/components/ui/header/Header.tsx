import styled from "./Header.module.css";

import {useState} from "react";
import {Link} from "react-router-dom";
import Hamburger from "./Hamburger";
import HamburgerMany from "./HamburgerMany";

type Props = {
  admin: boolean;
};

const Header: React.FC<Props> = ({admin}) => {
  const [manyList, setManyList] = useState(false);
  return (
    <header className={styled.header}>
      <div className={styled.container}>
        <Link to="/">店舗名</Link>

        <div>
          <Hamburger setManyList={setManyList} manyList={manyList} />
          {manyList && <HamburgerMany setManyList={setManyList} admin={admin} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
