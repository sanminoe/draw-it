import styles from "./Room.module.css";
function Room() {
  return (
    <div className={styles.Room}>
      <div>Room 1</div>
      <div>
        <div>20 people</div>
        <div>
          <button>Join</button>
        </div>
      </div>
    </div>
  );
}

export default Room;
