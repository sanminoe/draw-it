import styles from "./Home.module.css";
import Room from "../../Components/Room/Room";

function Home() {
  return (
    <div className={styles.Wrapper}>
      <div className={styles.RoomsWrapper}>
        <Room />
      </div>
    </div>
  );
}

export default Home;
