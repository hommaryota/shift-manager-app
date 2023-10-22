import React, {useState} from "react";
import styles from "./Profile.module.css";
import modal from "./Modal.module.css";
import {TextField} from "@material-ui/core";
import {auth} from "../../../firebase";
import SendIcon from "@mui/icons-material/Send";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import {FirebaseError} from "firebase/app";
import CloseIcon from "@mui/icons-material/Close";
import {Button} from "@material-ui/core";

type Props = {
  text: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
};

const Profile: React.FC<Props> = ({text, setLastName}) => {
  const authCurrentUser = auth.currentUser!;

  const currentEmail = authCurrentUser?.email;
  const [email, setEmail] = useState(currentEmail);

  const userName = authCurrentUser?.displayName;
  const [currentLastName, currentFirstName] = userName!.split(" ");

  // const [lastName, setLastName] = useState(currentLastName);
  const [name, setName] = useState(currentLastName);
  const [firstName, setFirstName] = useState(currentFirstName);

  // const currentPhonNumber = authCurrentUser.phoneNumber;
  // const [phoneNumber, setPhoneNumber] = useState<string>(currentPhonNumber | "");

  const [password, setPassword] = useState("");
  const [isModal, setIsModal] = useState(false);

  const changeProfile = () => {
    updateProfile(authCurrentUser, {
      displayName: `${name} ${firstName}`,
    })
      .then(() => {
        alert("プロフィールを更新しました。");
        // setLastName(name);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <>
      <h2 className={styles.title}>{text}</h2>
      <div>
        <TextField
          margin="normal"
          required
          fullWidth
          name="email"
          label="Email address"
          type="email"
          id="email"
          autoComplete="current-email"
          value={email}
          disabled
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {isModal && (
        <Modal
          setIsModal={setIsModal}
          password={password}
          setPassword={setPassword}
          email={email}
          setEmail={setEmail}
          authCurrentUser={authCurrentUser}
        />
      )}
      <p>
        Email addressを変更する場合はこちら
        <SendIcon onClick={() => setIsModal(true)} />
      </p>
      <div>
        <div className={styles.flex}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="lastName"
            label="苗字"
            type="lastName"
            id="lastName"
            autoComplete="current-lastName"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="firstName"
            label="名前"
            type="firstName"
            id="firstName"
            autoComplete="current-firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <TextField
          margin="normal"
          required
          fullWidth
          name="phonNumber"
          label="電話番号"
          type="phonNumber"
          id="phonNumber"
          autoComplete="current-phonNumber"
        />
        <Button
          fullWidth
          variant="contained"
          color="default"
          onClick={() => changeProfile()}
          className={modal.decisionButton}
        >
          変更を確定する
        </Button>
      </div>
    </>
  );
};

type ModalProps = {
  setIsModal: any;
  password: any;
  setPassword: any;
  email: any;
  setEmail: any;
  authCurrentUser: any;
};

const Modal: React.FC<ModalProps> = ({
  setIsModal,
  password,
  setPassword,
  email,
  setEmail,
  authCurrentUser,
}) => {
  const changeEmail = async () => {
    (async () => {
      try {
        const credential = await EmailAuthProvider.credential(
          authCurrentUser?.email ?? "",
          password
        );
        authCurrentUser &&
          (await reauthenticateWithCredential(authCurrentUser, credential));
        //メールアドレス、パスワードリセットの処理
        await updateEmail(authCurrentUser, email)
          .then(() => {
            alert(`${email}に変更しました。`);
          })
          .then(() => {
            setIsModal(false);
            setPassword("");
          })
          .catch((err) => {
            console.log(err.message);
          });
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.error(e);
        }
      }
    })();
  };
  return (
    <>
      <div className={modal.overlay} onClick={() => setIsModal(false)}></div>
      <div className={modal.modal}>
        <CloseIcon onClick={() => setIsModal(false)} className={modal.closeIcon} />
        <h2 className={modal.title}>Emailアドレスを変更する</h2>
        <div className={modal.inputArea}>
          <label htmlFor="email">変更するEmailアドレスを入力</label>
          <input
            className={modal.input}
            type="text"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <p className={modal.center}>パスワードを入力してください</p>
        <div className={modal.inputArea}>
          <label htmlFor="password">password</label>
          <input
            className={modal.input}
            type="text"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className={modal.buttonArea}>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => changeEmail()}
            className={modal.decisionButton}
          >
            確定
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              setIsModal(false);
              setPassword("");
            }}
            className={modal.cancelButton}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </>
  );
};

export default Profile;
