import { MouseEventHandler } from "react";
import { BsPencil, BsEraser, BsCircle } from "react-icons/bs";
import { BiRectangle } from "react-icons/bi";
import { AiOutlineLine, AiOutlineDelete } from "react-icons/ai";
import { CgColorPicker } from "react-icons/cg";
import ButtonTool from "../ButtonTool/ButtonTool";
import styles from "./ButtonsSection.module.css";
interface Props {
  onClick: Function;
  tool: string;
  onClearCanvas: MouseEventHandler;
  onSetColor: Function;
  color: string;
}

function ButtonsSection(props: Props) {
  return (
    <div className={styles.Buttons}>
      <ButtonTool
        icon={<BsPencil />}
        onClick={() => props.onClick("pen")}
        selected={props.tool === "pen"}
      />
      <ButtonTool
        icon={<BsEraser />}
        onClick={() => props.onClick("eraser")}
        selected={props.tool === "eraser"}
      />
      <ButtonTool
        icon={<BiRectangle />}
        onClick={() => props.onClick("rectangle")}
        selected={props.tool === "rectangle"}
      />
      <ButtonTool
        icon={<BsCircle />}
        onClick={() => props.onClick("ellipse")}
        selected={props.tool === "ellipse"}
      />
      <ButtonTool
        icon={<AiOutlineLine />}
        onClick={() => props.onClick("line")}
        selected={props.tool === "line"}
      />
      <ButtonTool
        icon={<CgColorPicker />}
        onClick={() => props.onClick("picker")}
        selected={props.tool === "picker"}
      />
      <ButtonTool
        icon={<AiOutlineDelete />}
        onClick={props.onClearCanvas}
        selected={false}
      />
      <div className={styles.ColorPickerWrapper}>
        <input
          type="color"
          name="color"
          id="color"
          value={props.color}
          onChange={(e) => props.onSetColor(e.currentTarget.value)}
        />
      </div>
    </div>
  );
}

export default ButtonsSection;
