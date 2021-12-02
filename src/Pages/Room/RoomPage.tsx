import { SyntheticEvent, useEffect, useRef, useState } from "react";
import drawOval from "../../helpers/drawOval";
import { rgbToHex } from "../../helpers/rgbToHex";
import ButtonsSection from "../../Components/ButtonsSection/ButtonsSection";
import style from "./RoomPage.module.css";
// import socketIOClient from "socket.io-client";
import type { Point, Shape } from "../../types/generic";
// fix bug when one click with other tools
import {
  rectangleDraw,
  lineDraw,
  penDraw,
  ellipseDraw,
  eraserDraw,
} from "../../helpers/shapeDraw";
import { BsGithub } from "react-icons/bs";

function RoomPage() {
  // Canvas state
  let [data, setData] = useState<Shape[]>([]);

  // Tools settings
  let [tool, setTool] = useState("pen");
  let [toolSize, setToolSize] = useState(10);
  const [toolColor, setToolColor] = useState("#000000");
  let [isFilled, setIsFilled] = useState(false);

  // Drawing history

  let isDrawing = useRef<Boolean>(false);

  let overlayRef = useRef<HTMLCanvasElement>(null);
  let canvasRef = useRef<HTMLCanvasElement>(null);

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

  const renderToolPreview = (
    ctx: CanvasRenderingContext2D,
    mousePosition: Point
  ) => {
    ctx?.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx?.arc(mousePosition.x, mousePosition.y, toolSize / 2, 0, 2 * Math.PI);
    ctx?.stroke();
    ctx?.closePath();
  };

  interface MouseCords {
    x: number;
    y: number;
  }
  const colorPickerTool = (
    ctx: CanvasRenderingContext2D,
    mousePosition: MouseCords
  ): string => {
    const imageData = ctx.getImageData(
      mousePosition.x,
      mousePosition.y,
      1,
      1
    ).data;

    return rgbToHex(imageData[0], imageData[1], imageData[2]);
  };

  // const fillToolHandler = (
  //   ctx: CanvasRenderingContext2D,
  //   startX: number,
  //   startY: number,
  //   startR: number,
  //   startG: number,
  //   startB: number
  // ) => {};

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setData([]);
  };

  const handlerOverlayMouseDown = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let mousePos = getMousePosition(e);
    let ctx = overlayRef.current?.getContext("2d");
    let orCtx = canvasRef.current?.getContext("2d");
    if (tool === "picker") {
      let color = colorPickerTool(orCtx as CanvasRenderingContext2D, mousePos);
      setTool("pen");
      setToolColor(color);
      return;
    }
    isDrawing.current = true;

    let shape = {
      tool,
      points: [
        {
          x: mousePos.x,
          y: mousePos.y,
          color: toolColor,
          size: toolSize,
          filled: isFilled,
        },
      ],
    };
    if (shape.tool === "pen") {
      console.log("PEN");
      penDraw(ctx!, shape);

      penDraw(orCtx!, shape);
    } else if (tool === "eraser") {
      eraserDraw(ctx!, shape);

      eraserDraw(orCtx!, shape);

      ctx!.strokeStyle = "white";
    } else if (tool === "rectangle") {
      console.log("RECTANGLE");
      // ctx!.lineCap = "square";
      rectangleDraw(ctx!, shape);
    } else if (tool === "ellipse") {
      ellipseDraw(ctx!, shape);
      ctx!.lineWidth = toolSize;
    } else if (tool === "line") {
      lineDraw(ctx!, shape);
    } else {
      return;
    }
    setData([...data, shape]);
  };

  const handlerOverlayMouseMove = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    let ctx = overlayRef.current?.getContext("2d");
    let orCtx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let mousePos = getMousePosition(e);
    // Tool preview
    renderToolPreview(ctx!, mousePos);
    if (!isDrawing.current && tool !== "picker") {
      return;
    }
    if (tool === "picker") {
      return;
    }

    let lastShape = data[data.length - 1];
    lastShape.points = lastShape.points.concat([
      {
        x: mousePos.x,
        y: mousePos.y,
        color: toolColor,
        size: toolSize,
        filled: isFilled,
      },
    ]);
    if (tool === "pen") {
      penDraw(ctx!, lastShape);
      penDraw(orCtx!, lastShape);

      ctx?.stroke();
    } else if (tool === "eraser") {
      eraserDraw(ctx!, lastShape);
      ctx?.stroke();

      eraserDraw(orCtx!, lastShape);
    } else if (tool === "rectangle") {
      rectangleDraw(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseDraw(ctx!, lastShape);
      ctx!.lineWidth = toolSize;
    } else if (tool === "line") {
      lineDraw(ctx!, lastShape);
    }
    renderToolPreview(ctx!, mousePos);
    setData(data.concat());
  };

  const render = () => {
    // let overCtx = overlayRef.current?.getContext("2d");
    // overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);

    let ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < data.length; i++) {
      const shape = data[i];

      if (shape.tool === "pen") {
        penDraw(ctx!, shape);
        ctx?.stroke();
      } else if (shape.tool === "eraser") {
        eraserDraw(ctx!, shape);
        ctx?.stroke();
      } else if (tool === "rectangle") {
        rectangleDraw(ctx!, shape);
      } else if (tool === "ellipse") {
        ellipseDraw(ctx!, shape);
      } else if (tool === "line") {
        lineDraw(ctx!, shape);
      }
    }
  };

  const handlerOverlayMouseUp = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    // Render to the main canvas
    isDrawing.current = false;
    let overCtx = overlayRef.current?.getContext("2d");
    overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);

    let ctx = canvasRef.current?.getContext("2d");
    let lastShape = data[data.length - 1];

    renderToolPreview(overCtx!, getMousePosition(e));

    if (tool === "pen") {
      penDraw(ctx!, lastShape);
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "eraser") {
      eraserDraw(ctx!, lastShape);
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "rectangle") {
      rectangleDraw(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseDraw(ctx!, lastShape);
    } else if (tool === "line") {
      lineDraw(ctx!, lastShape);
    } else {
      return;
    }
  };
  const handlerOverlayMouseLeave = (
    e: SyntheticEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!isDrawing.current) {
      return;
    }

    let mousePos = getMousePosition(e);
    let lastShape = data[data.length - 1];
    lastShape.points = lastShape.points.concat([
      {
        x: mousePos.x,
        y: mousePos.y,
        color: toolColor,
        size: toolSize,
        filled: isFilled,
      },
    ]);

    isDrawing.current = false;
    let overCtx = overlayRef.current?.getContext("2d");
    overCtx?.clearRect(0, 0, overCtx.canvas.width, overCtx.canvas.height);

    let ctx = canvasRef.current?.getContext("2d");

    if (tool === "pen") {
      if (lastShape.points.length > 5) {
        ctx?.stroke();
      }
    } else if (tool === "eraser") {
      ctx?.stroke();
    } else if (tool === "rectangle") {
      rectangleDraw(ctx!, lastShape);
    } else if (tool === "ellipse") {
      ellipseDraw(ctx!, lastShape);
    } else if (tool === "line") {
      lineDraw(ctx!, lastShape);
    }
    setData(data.concat());
  };

  const undoHandler = () => {
    //
  };

  useEffect(() => {
    let ctx = canvasRef.current?.getContext("2d");
    ctx!.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";
  }, [tool]);

  return (
    <div className={style.Wrapper}>
      <div>
        <div className={style.ToolsOptions}>
          <div className={style.ToolFill}>
            <span>Fill</span>
            <input
              type="checkbox"
              name="color"
              id="color"
              value={String(isFilled)}
              onClick={() => setIsFilled(!isFilled)}
            />
          </div>
          <div className={style.sizeWrapper}>
            <div>
              <label htmlFor="toolSize">Size</label>
              <input
                className={style.sizeInput}
                type="range"
                min="1"
                max="100"
                name="toolSize"
                value={toolSize}
                onChange={(e) => setToolSize(+e.currentTarget.value)}
              />
            </div>
          </div>

          {/* <div>
            <button onClick={undoHandler}>Undo</button>
            <button>Redo</button>
          </div> */}
        </div>
        <div className={style.Canvases}>
          <ButtonsSection
            onClick={(v: string) => setTool(v)}
            tool={tool}
            onClearCanvas={clearCanvas}
            onSetColor={setToolColor}
            color={toolColor}
          />
          <div className={style.CanvasWrapper}>
            <canvas
              ref={overlayRef}
              id={style.overlay}
              width={950}
              height={500}
              onMouseMove={handlerOverlayMouseMove}
              onMouseDown={handlerOverlayMouseDown}
              onMouseUp={handlerOverlayMouseUp}
              onMouseLeave={handlerOverlayMouseLeave}
            />

            <canvas
              className={style.canvas}
              ref={canvasRef}
              width={950}
              height={500}
            />
          </div>
        </div>
      </div>
      <div className="linkGithub">
        <a
          href="https://github.com/sanminoe/draw-it"
          style={{ color: "white" }}
          target="_blank"
        >
          By Sanminoe {<BsGithub />}
        </a>
      </div>
    </div>
  );
}

export default RoomPage;
