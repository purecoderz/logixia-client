import { EditorView } from "@codemirror/view";

/** CodeMirror offsets are UTF-16 document positions, independent of visual wrapping. */
export interface EditorAnchor { kind: "editor"; offset: number }
export function editorView(surface: HTMLElement): EditorView | null {
  const element = surface.querySelector<HTMLElement>(".cm-editor");
  return element ? EditorView.findFromDOM(element) : null;
}
export function captureEditorAnchor(surface: HTMLElement, x: number, y: number): EditorAnchor | undefined {
  const view = editorView(surface);
  if (!view) return;
  const bounds = view.scrollDOM.getBoundingClientRect();
  if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return;
  const offset = view.posAtCoords({x,y});
  if (offset !== null) return {kind:"editor",offset};
}
export function resolveEditorAnchor(surface: HTMLElement, anchor: EditorAnchor): {x:number;y:number} | null {
  const view = editorView(surface);
  if (!view || anchor.offset > view.state.doc.length) return null;
  const coords = view.coordsAtPos(anchor.offset);
  if (!coords) return null;
  const viewport = view.scrollDOM.getBoundingClientRect();
  const x = coords.left, y = (coords.top+coords.bottom)/2;
  if (x < viewport.left || x > viewport.right || y < viewport.top || y > viewport.bottom) return null;
  const bounds = surface.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return null;
  return {x:(x-bounds.left)/bounds.width,y:(y-bounds.top)/bounds.height};
}
export function followEditorAnchor(surface: HTMLElement, anchor: EditorAnchor) {
  const view = editorView(surface);
  if (view && anchor.offset <= view.state.doc.length) {
    view.dispatch({effects:EditorView.scrollIntoView(anchor.offset,{y:"center"})});
  }
}
