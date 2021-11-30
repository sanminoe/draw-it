import { MouseEventHandler, ReactElement } from "react";
import style from "./ButtonTool.module.css";
interface Props {
  icon: ReactElement;
  onClick: MouseEventHandler<HTMLButtonElement>;
  selected: boolean;
}

function ButtonTool(props: Props) {
  return (
    <button
      className={[style.Button, props.selected ? style.Selected : null].join(
        " "
      )}
      onClick={props.onClick}
    >
      {props.icon}
    </button>
  );
}

export default ButtonTool;
