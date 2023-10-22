import React, {useState} from "react";
import styles from "./Auth.module.css";
import {useDispatch} from "react-redux";
import {updateUserProfile} from "../../features/userSlice";
import {auth, provider} from "../../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import EmailIcon from "@material-ui/icons/Email";
import SendIcon from "@mui/icons-material/Send";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Modal, makeStyles} from "@material-ui/core";
import {IconButton} from "@mui/material";
import CameraIcon from "@mui/icons-material/Camera";
import {db} from "../../firebase";
import {arrayUnion, doc, setDoc, updateDoc} from "firebase/firestore";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const theme = createTheme();

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  image: {
    backgroundImage:
      "url(https://images.unsplash.com/photo-1589793907316-f94025b46850?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=932&q=80)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "light" ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: "none",
    position: "absolute",
    width: 400,
    borderRadius: 10,
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}));

const Auth = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [telNumber, setTelNumber] = useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [isLogin, setIsLogin] = useState(true);

  const sendResetEmail = async (e: any) => {
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setOpenModal(false);
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, "admin", "users"), {
      user: arrayUnion(authUser.user.uid),
    });

    await setDoc(doc(db, "users", authUser.user.uid), {
      id: authUser.user.uid,
      telNumber: telNumber,
      events: [],
      timestamp: new Date().getTime().toString(),
      displayName: `${lastName} ${firstName}`,
    });

    if (authUser.user) {
      await updateProfile(authUser.user, {
        displayName: `${lastName} ${firstName}`,
        // phoneNumber: telNumber,
      });
    }

    dispatch(
      updateUserProfile({
        displayName: `${lastName} ${firstName}`,
        phoneNumber: telNumber,
      })
    );
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      password: data.get("password"),
    });
  };

  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => console.log(err.message));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{m: 1, bgcolor: "secondary.main"}}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {isLogin ? "Sign in" : "register"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
            {!isLogin && (
              <>
                <div className={styles.flex}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="lastName"
                    label="性"
                    type="lastName"
                    id="lastName"
                    autoComplete="current-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="firstName"
                    label="名"
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
                  name="telNumber"
                  label="電話番号"
                  type="telNumber"
                  id="telNumber"
                  autoComplete="current-telNumber"
                  value={telNumber}
                  onChange={(e) => setTelNumber(e.target.value)}
                />
              </>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Emailアドレス"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              disabled={
                isLogin
                  ? !email || password.length < 6
                  : !lastName || !firstName || !email || password.length < 6
              }
              fullWidth
              variant="contained"
              sx={{mt: 3, mb: 2}}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                  ? async () => {
                      try {
                        await signInEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
                  : async () => {
                      try {
                        await signUpEmail();
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }
              }
            >
              {isLogin ? "Login" : "register"}
            </Button>

            <Grid container>
              <Grid item xs>
                {isLogin && (
                  <span className={styles.login_reset} onClick={() => setOpenModal(true)}>
                    Forgot password?
                  </span>
                )}
              </Grid>
              <Grid item>
                <span
                  className={styles.login_toggleMode}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Create new account" : "Back to login"}
                </span>
              </Grid>
            </Grid>

            <Button
              onClick={signInGoogle}
              fullWidth
              variant="contained"
              sx={{mt: 3, mb: 2}}
              startIcon={<CameraIcon />}
            >
              SignIn with Google
            </Button>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <div style={getModalStyle()} className={classes.modal}>
                <div className={styles.login_modal}>
                  <TextField
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="email"
                    name="email"
                    label="Reset E-mail"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                    }}
                  />
                  <IconButton onClick={sendResetEmail}>
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </Modal>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Auth;
