import { SyntheticEvent, useRef, useState } from "react";
import style from "./RoomPage.module.css";

type Point = {
  x: number;
  y: number;
};
interface DrawingData {
  tool: string;
  points: Point[];
}
function RoomPage() {
  let [tool, setTool] = useState("pen");
  let [data, setData] = useState<DrawingData[]>([]);
  let isDrawing = useRef<Boolean>(false);
  let canvasRef = useRef<HTMLCanvasElement>(null);

  const handlerOnMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ): void => {
    isDrawing.current = true;
    const mousePos = getMousePosition(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (tool === "pen") {
      ctx?.beginPath();
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.lineWidth = 30;
      ctx?.moveTo(mousePos.x, mousePos.y);
    } else if (tool === "eraser") {
      ctx?.beginPath();
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";
      ctx!.lineWidth = 30;
      ctx?.moveTo(mousePos.x, mousePos.y);
    }
    setData([...data, { tool, points: [{ x: mousePos.x, y: mousePos.y }] }]);
  };

  const handlerOnMove = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ): void => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current!.getContext("2d");
    const mousePos = getMousePosition(e);

    if (tool === "pen") {
      // data.map((d) => {
      //   render(ctx!, d);
      // });
      ctx?.lineTo(mousePos.x, mousePos.y);
      ctx?.stroke();
      ctx!.globalCompositeOperation = "source-over";
    } else if (tool === "eraser") {
      ctx!.globalCompositeOperation = "destination-out";
      ctx?.lineTo(mousePos.x, mousePos.y);
      ctx?.stroke();
    }
    let lastLine = data[data.length - 1];

    lastLine.points = lastLine.points.concat([
      { x: mousePos.x, y: mousePos.y },
    ]);
    setData(data.concat());
  };

  const handlerMouseUp = (e: SyntheticEvent<HTMLCanvasElement, MouseEvent>) => {
    const ctx = canvasRef.current!.getContext("2d");
    // ctx?.closePath();
    isDrawing.current = false;
  };

  const getMousePosition = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let x =
      e.nativeEvent.clientX - canvasRef.current!.getBoundingClientRect().left;
    let y =
      e.nativeEvent.clientY - canvasRef.current!.getBoundingClientRect().top;
    return {
      x,
      y,
    };
  };

  const render = (ctx: CanvasRenderingContext2D, obj: DrawingData) => {
    // Render incoming data
    let points = obj.points;
    if (points.length < 6) {
      let p = points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    ctx!.lineWidth = 30;

    ctx.moveTo(points[0].x, points[0].y);

    let i = 1;

    for (i = 1; i < points.length - 2; i++) {
      const c1 = (points[i].x + points[i + 1].x) / 2;
      const c2 = (points[i].y + points[i + 1].y) / 2;

      ctx.quadraticCurveTo(points[i].x, points[i].y, c1, c2);
    }
    ctx.stroke();
  };
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setData([]);
  };

  return (
    <div className={style.Wrapper}>
      <div className={style.ToolsWrapper}>
        <button onClick={() => setTool("pen")}>Pen</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>
        <button onClick={() => setTool("rectangle")}>rectangle</button>
        <button onClick={() => setTool("ellipse")}>Elipse</button>
        <button onClick={() => setTool("line")}>Line</button>
        <button onClick={() => clearCanvas()}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        onMouseMove={handlerOnMove}
        onMouseDown={handlerOnMouseDown}
        onMouseUp={handlerMouseUp}
      />
    </div>
  );
}

export default RoomPage;
