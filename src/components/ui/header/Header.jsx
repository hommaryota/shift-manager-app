import styled from "./Header.module.css";

import {useState} from "react";
import {Link} from "react-router-dom";
import Hamburger from "./Hamburger";
import HamburgerMany from "./HamburgerMany";

const Header = ({currentLastName, admin}) => {
  const [manyList, setManyList] = useState(false);
  return (
    <header className={styled.header}>
      <div className={styled.container}>
        <Link to="/">店舗名</Link>

        <div>
          <Hamburger setManyList={setManyList} currentLastName={currentLastName} manyList={manyList} />
          {manyList && <HamburgerMany setManyList={setManyList} admin={admin} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
