import { captureEditorAnchor, resolveEditorAnchor, followEditorAnchor } from "./editorAnchor";
import { captureExplorerAnchor, followExplorerAnchor, resolveExplorerAnchor } from "./explorerAnchor";
import "./pointers.css";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { LivePointers } from "./useLivePointers";
import type { PointerPanel, PointerPosition, RemotePointer } from "./pointer";

const colors = ["#38bdf8", "#fbbf24", "#c084fc", "#34d399", "#fb7185"];
function colorFor(id:string) { return colors[[...id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%colors.length]; }
export function RemotePointers({ pointers }: { pointers:RemotePointer[] }) {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-40 overflow-hidden">{pointers.map(pointer=><div key={pointer.owner.id} className="absolute transition-[left,top] duration-75 ease-linear motion-reduce:transition-none" style={{left:`${pointer.x*100}%`,top:`${pointer.y*100}%`,color:colorFor(pointer.owner.id)}}>
    <svg width="18" height="22" viewBox="0 0 18 22" fill="currentColor"><path d="M1 1v17l5-4 4 7 3-2-4-7 7-1Z" stroke="#0d1117" strokeWidth="1.5"/></svg>
    <span className={`absolute top-5 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-950 ${pointer.x > .7 ? "right-0" : "left-3"}`} style={{backgroundColor:colorFor(pointer.owner.id)}}>{pointer.owner.name}</span>
    {!!pointer.click && <span key={pointer.click} className="absolute -left-3 -top-3 size-7 live-pointer-click rounded-full border-2 opacity-0" style={{borderColor:"currentColor"}}/>}
  </div>)}</div>;
}
export function PointerSurface({panel,path,controller,children}:{panel:PointerPanel;path?:string|null;controller:LivePointers;children:ReactNode}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const followedClicks = useRef<Record<string,number>>({});
  const [resolved, setResolved] = useState<RemotePointer[]>([]);
  const hide = controller.hide;
  useEffect(() => {
    let frame: number;
    const update = () => {
      const surface = surfaceRef.current;
      if (!surface) return;
      const next = controller.pointers.filter(pointer=>pointer.panel === panel && (panel !== "editor" || !pointer.path || pointer.path === path)).flatMap(pointer=>{
        if (!pointer.anchor) return [pointer];
        if (pointer.click && followedClicks.current[pointer.owner.id] !== pointer.click) {
          followedClicks.current[pointer.owner.id] = pointer.click;
          if (pointer.anchor.kind === "editor") followEditorAnchor(surface,pointer.anchor);
          else followExplorerAnchor(surface,pointer.anchor);
        }
        const position = pointer.anchor.kind === "editor"
          ? resolveEditorAnchor(surface,pointer.anchor)
          : resolveExplorerAnchor(surface,pointer.anchor);
        return position ? [{...pointer,...position}] : [];
      });
      setResolved(previous=>JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      if (controller.pointers.some(pointer=>pointer.anchor)) frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  },[controller.pointers,panel,path]);
  useEffect(()=>()=>hide(),[hide,panel,path]);
  function position(event:PointerEvent<HTMLDivElement>):PointerPosition|null {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return null;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const anchor = panel === "editor" && path
      ? captureEditorAnchor(event.currentTarget,event.clientX,event.clientY)
      : panel === "explorer"
        ? captureExplorerAnchor(event.currentTarget,event.target,event.clientX,event.clientY)
        : undefined;
    return {...(anchor ? {anchor} : {}),panel,x:Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width)),y:Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height)),...(panel === "editor" && path ? {path} : {})};
  }
  return <div ref={surfaceRef} className="relative h-full min-h-0 min-w-0" onPointerMoveCapture={event=>{const p=position(event);if(p)controller.move(p);}} onPointerDownCapture={event=>{const p=position(event);if(p)controller.click(p);}} onPointerLeave={hide} onPointerCancel={hide} onScrollCapture={hide}>
    {children}<RemotePointers pointers={resolved}/>
  </div>;
}
