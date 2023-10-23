import React, {useState} from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import timeGridPlugin from "@fullcalendar/timegrid";
import styles from "./ShiftManager.module.css";

import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import {auth} from "../../firebase";

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import {db} from "../../firebase";

type Props = {
  text: string;
  users: never[];
};

const ShiftManager = ({text, users}: Props) => {
  const [isEditModal, setIsEditModal] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [lastTime, setLastTime] = useState("");
  const [newShift, setNewShift] = useState([]);
  const [comment, setComment] = useState("");
  const colRef = collection(db, "users");

  // 入力されてるシフトをクリックした際の処理
  async function handleEditDateClick(log: any) {
    setIsEditModal(true);
    if (users.length > 0) {
      users.map((user) => {
        if (log.event._def.resourceIds[0] !== user) return;

        const docUserRef = doc(colRef, user);
        (async () => {
          const docUserSnap = await getDoc(docUserRef);
          const c = docUserSnap.data()?.events;
          const editShift = c.filter((edit: any) => edit.id === log.event._def.publicId);
          // if (editShift[0].description !== "") {
          //   setComment([editShift[0].description, editShift[0].title, editShift[0].id]);
          // }
          setStartTime(editShift[0].start);
          setLastTime(editShift[0].end);
          setNewShift(editShift);
        })();
      });
    }
  }

  // 入力されてシフトの変更・確定した際の処理
  const editShift = async () => {
    if (users.length > 0) {
      users.map((user): void => {
        const docUserRef = doc(colRef, user);
        (async () => {
          const docUserSnap = await getDoc(docUserRef);
          const c = docUserSnap.data()?.events;
          const editShift = c.filter((edit: any) => edit.id === newShift[0]);
          if (editShift.length === 0) {
            return;
          }
          const docEditRef = doc(colRef, user);

          await updateDoc(doc(db, "users", editShift[0].resourceId), {
            events: arrayRemove(editShift[0]),
          });

          await updateDoc(docEditRef, {
            events: arrayUnion({
              id: editShift[0].id,
              resourceId: editShift[0].resourceId,
              title: editShift[0].title,
              color: "gray",
              oldStart: editShift[0].start,
              oldEnd: editShift[0].end,
              start: startTime,
              end: lastTime,
              description: editShift[0].description,
              edit: true,
              eventColor: "#378006",
            }),
          });

          // コメント更新用関数
          await updateDoc(
            doc(
              collection(db, "users", editShift[0].resourceId, "comments"),
              editShift[0].id
            ),
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

          setNewShift([]);
          setIsEditModal(false);
          setTitle("");
          setStartTime("");
          setLastTime("");
        })();
      });
    }
  };

  // モーダルを閉じる際の処理
  const resetModal = () => {
    setIsEditModal(false);
    setTitle("");
    setStartTime("");
    setLastTime("");
    setComment("");
  };

  return (
    <>
      <h2 className={styles.title}>{text}</h2>
      <FullCalendar
        eventBackgroundColor="#8db1fad9"
        editable={false}
        locale="ja"
        selectable={true}
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
          resourceTimelinePlugin,
        ]}
        initialView="resourceTimeline"
        eventClick={(e) => handleEditDateClick(e)}
        navLinks={false}
        headerToolbar={{
          start: "prev today", // will normally be on the left. if RTL, will be on the right
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay next,resourceTimeline", // will normally be on the right. if RTL, will be on the left
        }}
        events={[]}
        // className={styles.fullCalendar}
        resources={[]}
      />

      {isEditModal && (
        <EditModal
          startTime={startTime}
          setStartTime={setStartTime}
          lastTime={lastTime}
          setLastTime={setLastTime}
          title={title}
          setTitle={setTitle}
          editShift={editShift}
          comment={comment}
          resetModal={resetModal}
        />
      )}
    </>
  );
};

type EditProps = {
  startTime: any;
  setStartTime: any;
  lastTime: any;
  setLastTime: any;
  title: any;
  setTitle: any;
  editShift: any;
  comment: any;
  resetModal: any;
};
const EditModal = ({
  startTime,
  setStartTime,
  lastTime,
  setLastTime,
  title,
  setTitle,
  editShift,
  comment,
  resetModal,
}: EditProps) => {
  return (
    <>
      <div className={styles.overlay} onClick={() => resetModal()}></div>
      <div className={styles.modal}>
        <CloseIcon onClick={() => resetModal()} className={styles.closeIcon} />
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
        {comment && (
          <div className={styles.flex}>
            <p className={styles.userComment}>
              <span>{comment[1]}</span>
              <span>{new Date(Number(comment[2])).toLocaleString()}</span>
            </p>
            <span className={styles.comment}>{comment[0]}</span>
          </div>
        )}
        <div className={styles.buttonArea}>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => {
              editShift();
            }}
            className={styles.decisionButton}
          >
            確定する
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="default"
            onClick={() => resetModal()}
            className={styles.cancelButton}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </>
  );
};

export default ShiftManager;
