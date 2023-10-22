import React, {useEffect, useState} from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import styles from "./ShiftCalendar.module.css";

import interactionPlugin from "@fullcalendar/interaction";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import {auth} from "../../../firebase";

import {
  collection,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {db} from "../../../firebase";

type Props = {
  text: string;
};

const ShiftCalendar: React.FC<Props> = ({text}) => {
  const [isModal, setIsModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [lastTime, setLastTime] = useState("");
  const [newShift, setNewShift] = useState({});
  const [shift, setShift] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [editShiftFalse, setEditShiftFalse] = useState(false);
  const [editLog, setEditLog] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [comments, setComments] = useState("");

  const colRef = collection(db, "users");
  const docRef = doc(colRef, auth.currentUser?.uid);
  useEffect(() => {
    (async () => {
      const docSnap = await getDoc(docRef);
      if (docSnap.data() !== undefined) {
        return setShift(docSnap.data()?.events);
      }
    })();
  }, [newShift]);

  // カレンダーをクリックした際の処理
  function handleDateClick(log: any) {
    setIsModal(true);
    if ("dayGridMonth" === log.view.type) {
      const date = new Date();
      const hour = date.getHours().toString().padStart(2, "0");
      const minute = date.getMinutes().toString().padStart(2, "0");
      setStartTime(`${log.startStr}T${hour}:${minute}:00`);
      setLastTime(`${log.startStr}T${hour}:${minute}:00`);
      return;
    }

    setStartTime(log.startStr.replace("+09:00", ""));
    setLastTime(log.endStr.replace("+09:00", ""));
  }

  // モーダルからシフトの入力確定を押した際の処理
  const createShift = async () => {
    setNewShift({});
    const newDate = new Date().getTime().toString();

    await updateDoc(docRef, {
      events: arrayUnion({
        resourceId: auth.currentUser?.uid,
        id: newDate,
        title: `${auth.currentUser?.displayName}さん`,
        start: startTime,
        end: lastTime,
        description: title,
      }),
    });

    await setDoc(
      doc(collection(db, "users", String(auth.currentUser?.uid), "comments"), newDate),
      {
        comment: [
          {
            username: auth.currentUser?.displayName,
            text: title ? title : "作成",
            timestamp: newDate,
            start: startTime,
            end: lastTime,
            oldStart: startTime,
            oldEnd: lastTime,
          },
        ],
      }
    );

    setNewShift({
      comment: [
        {
          title: title,
          start: startTime,
          end: lastTime,
          newStart: startTime,
          newEnd: lastTime,
        },
      ],
    });
    setIsModal(false);
    setTitle("");
    setStartTime("");
    setLastTime("");
  };

  // 作成したシフトをクリックした際の処理
  async function handleEditDateClick(log: any) {
    const docSnap = await getDoc(docRef);
    const editShift = docSnap
      .data()
      ?.events.filter((edit: any) => edit.id.toString() === log.event._def.publicId);
    setEditLog(editShift);
    setStartTime(editShift[0].start);
    setLastTime(editShift[0].end);
    setShiftId(log.event._def.publicId);

    const q = doc(
      collection(db, "users", String(auth.currentUser?.uid), "comments"),
      log.event._def.publicId
    );
    const aaa = await getDoc(q);
    if (aaa.data() !== undefined) {
      setComments(aaa.data()?.comment);
    }
    if (log.event._def.extendedProps.edit === true) {
      setEditShiftFalse(true);
    }
    setIsEditModal(true);
  }

  // 作成したシフトを更新する際の処理
  const editShift = async () => {
    setNewShift("");
    const docSnap = await getDoc(docRef);
    const editShift = docSnap.data()?.events.filter((edit: any) => edit.id === shiftId);

    // 現在のシフトを削除する関数
    updateDoc(docRef, {
      events: arrayRemove(editShift[0]),
    });
    // シフト更新用関数
    if (editShift[0].edit === true) {
      updateDoc(docRef, {
        events: arrayUnion({
          id: editShift[0].id,
          edit: true,
          color: "gray",
          resourceId: editShift[0].resourceId,
          title: `${auth.currentUser?.displayName}さん`,
          oldStart: editShift[0].start,
          oldEnd: editShift[0].end,
          start: startTime,
          end: lastTime,
          description: editShift[0].description,
        }),
      });
    } else {
      updateDoc(docRef, {
        events: arrayUnion({
          id: editShift[0].id,
          resourceId: editShift[0].resourceId,
          title: `${auth.currentUser?.displayName}さん`,
          oldStart: editShift[0].start,
          oldEnd: editShift[0].end,
          start: startTime,
          end: lastTime,
          description: editShift[0].description,
        }),
      });
    }

    // コメント更新用関数
    if (editShift[0].startTime !== startTime || editShift[0].lastTime !== lastTime) {
      await updateDoc(
        doc(collection(db, "users", String(auth.currentUser?.uid), "comments"), shiftId),
        {
          comment: arrayUnion({
            text: title,
            timestamp: new Date().getTime().toString(),
            username: auth.currentUser?.displayName,
            oldStart: editShift[0].start,
            oldEnd: editShift[0].end,
            start: startTime,
            end: lastTime,
          }),
        }
      );
    } else {
      await updateDoc(
        doc(collection(db, "users", String(auth.currentUser?.uid), "comments"), shiftId),
        {
          comment: arrayUnion({
            text: title,
            timestamp: new Date().getTime().toString(),
            username: auth.currentUser?.displayName,
            start: startTime,
            end: lastTime,
          }),
        }
      );
    }

    setNewShift({
      title: title,
      start: startTime,
      end: lastTime,
    });
    setIsEditModal(false);
    setTitle("");
    setStartTime("");
    setLastTime("");
  };

  const test = async () => {
    if (confirm) {
      const docSnap = await getDoc(docRef);
      setShift(docSnap.data()?.events);
    }
    if (!confirm) {
      const docSnap = await getDoc(docRef);
      const editShift = docSnap
        .data()
        ?.events.filter((event: any) => event.edit === true);
      setShift(editShift);
    }
    setConfirm((prevState) => !prevState);
  };

  return (
    <>
      <h2 className={styles.title}>{text}</h2>
      <FullCalendar
        eventBackgroundColor="#8db1fad9"
        editable={false}
        locale="ja"
        selectable={true}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        select={(e) => handleDateClick(e)}
        eventClick={(e) => handleEditDateClick(e)}
        navLinks={false}
        headerToolbar={{
          start: "prev today", // will normally be on the left. if RTL, will be on the right
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay next", // will normally be on the right. if RTL, will be on the left
        }}
        events={shift}
        // className={styles.fullCalendar}
      />

      <Button
        fullWidth
        variant="contained"
        className={styles.button}
        onClick={() => test()}
      >
        確定したシフトのみ表示
        {confirm ? "確定したシフトのみ表示" : "提出したシフトを表示"}
      </Button>

      {isModal && (
        <Modal
          setIsModal={setIsModal}
          startTime={startTime}
          setStartTime={setStartTime}
          lastTime={lastTime}
          setLastTime={setLastTime}
          title={title}
          setTitle={setTitle}
          createShift={createShift}
        />
      )}
      {isEditModal && (
        <EditModal
          setIsEditModal={setIsEditModal}
          startTime={startTime}
          setStartTime={setStartTime}
          lastTime={lastTime}
          setLastTime={setLastTime}
          title={title}
          setTitle={setTitle}
          editShiftFalse={editShiftFalse}
          setEditShiftFalse={setEditShiftFalse}
          comments={comments}
          setComments={setComments}
          editLog={editLog}
          editShift={editShift}
        />
      )}
    </>
  );
};

type ModalProps = {
  setIsModal: any;
  startTime: any;
  setStartTime: any;
  lastTime: any;
  setLastTime: any;
  title: any;
  setTitle: any;
  createShift: any;
};

const Modal: React.FC<ModalProps> = ({
  setIsModal,
  startTime,
  setStartTime,
  lastTime,
  setLastTime,
  title,
  setTitle,
  createShift,
}) => {
  return (
    <>
      <div className={styles.overlay} onClick={() => setIsModal(false)}></div>
      <div className={styles.modal}>
        <CloseIcon onClick={() => setIsModal(false)} className={styles.closeIcon} />
        <h2 className={styles.modalTitle}>シフトタイム</h2>
        <div className={styles.input}>
          <label htmlFor="startTime">開始時間</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <p className={styles.text}>~</p>
        <div className={styles.input}>
          <label htmlFor="lastTime">終了時間</label>
          <input
            type="datetime-local"
            id="lastTime"
            name="lastTime"
            value={lastTime}
            onChange={(e) => setLastTime(e.target.value)}
          />
        </div>
        <div className={styles.message}>
          <p>備考</p>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.buttonArea}>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              createShift();
            }}
            className={styles.decisionButton}
          >
            確定する
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              setIsModal(false);
              setTitle("");
              setStartTime("");
              setLastTime("");
            }}
            className={styles.cancelButton}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </>
  );
};

type EditModalProps = {
  setIsEditModal: any;
  startTime: any;
  setStartTime: any;
  lastTime: any;
  setLastTime: any;
  title: any;
  setTitle: any;
  editShift: any;
  editShiftFalse: any;
  setEditShiftFalse: any;
  comments: any;
  setComments: any;
  editLog: any;
};

const EditModal: React.FC<EditModalProps> = ({
  setIsEditModal,
  startTime,
  setStartTime,
  lastTime,
  setLastTime,
  title,
  setTitle,
  editShift,
  editShiftFalse,
  setEditShiftFalse,
  comments,
  setComments,
  editLog,
}) => {
  const [editButton, setEditButton] = useState(false);
  useEffect(() => {
    if (editLog[0].start === startTime && editLog[0].end === lastTime && title === "") {
      setEditButton(true);
    } else {
      setEditButton(false);
    }
  }, [startTime, lastTime, title]);
  return (
    <>
      <div
        className={styles.overlay}
        onClick={() => {
          setIsEditModal(false);
          setTitle("");
          setStartTime("");
          setLastTime("");
          setEditShiftFalse(false);
          setComments("");
        }}
      ></div>
      <div className={styles.modal}>
        <CloseIcon
          onClick={() => {
            setIsEditModal(false);
            setTitle("");
            setStartTime("");
            setLastTime("");
            setEditShiftFalse(false);
            setComments("");
          }}
          className={styles.closeIcon}
        />
        <h2 className={styles.modalTitle}>シフトタイム</h2>
        <div className={styles.input}>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={editShiftFalse}
          />
          <label htmlFor="startTime">開始時間</label>
        </div>
        <p className={styles.text}>~</p>
        <div className={styles.input}>
          <input
            type="datetime-local"
            id="lastTime"
            name="lastTime"
            value={lastTime}
            onChange={(e) => setLastTime(e.target.value)}
            disabled={editShiftFalse}
          />
          <label htmlFor="lastTime">終了時間</label>
        </div>
        <div className={styles.message}>
          <p>備考</p>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        {comments &&
          comments.map((commentList: any) => (
            <div key={commentList.timestamp} className={styles.flex}>
              <p className={styles.userComment}>
                <span>{commentList.username}</span>
                <span>{new Date(Number(commentList.timestamp)).toLocaleString()}</span>
              </p>
              {commentList.text !== "" && (
                <span className={styles.comment}>{commentList.text}</span>
              )}
              {commentList.oldStart !== commentList.start && (
                <span className={styles.comment}>
                  <p>
                    {commentList.oldStart}から{commentList.start}へ変更しました
                  </p>
                </span>
              )}
              {commentList.oldEnd !== commentList.end && (
                <span className={styles.comment}>
                  <p>
                    {commentList.oldEnd}から{commentList.end}へ変更しました
                  </p>
                </span>
              )}
            </div>
          ))}
        <div className={styles.buttonArea}>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              editShift();
            }}
            // className={styles.decisionButton}
            className={editButton ? styles.disabledButton : styles.decisionButton}
            disabled={editButton}
          >
            {editShiftFalse ? "コメントする" : "変更する"}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              setIsEditModal(false);
              setTitle("");
              setStartTime("");
              setLastTime("");
              setEditShiftFalse(false);
            }}
            className={styles.cancelButton}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </>
  );
};

export default ShiftCalendar;
