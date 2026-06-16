import { encode } from '@toon-format/toon'
import type { ExcalidrawElement } from '../schemas'
import { languages } from '@excalidraw/excalidraw/i18n';

// toon serialiser 
export function serializeCanvasState(elements: ExcalidrawElement[]) {
    if (!elements.length) return 'canvas: empty'; // this is better than null for LLMs
    // else serialiseCanva
    const rows = elements.map((el) => ({
        id: el.id,
        type: el.type,
        x: Math.round(el.x),
        y: Math.round(el.y),
        w: Math.round(el.width),
        h: Math.round(el.height),
        label: el.type == "text" ? el.text : '',
        from: el.type == "arrow" ? el.startBinding?.elementId ?? "" : "",
        to: el.type =="arrow"? el.endBinding?.elementId??"":"",
    }))

    return encode(
        { elements: rows },
        {indent:2, delimiter:",", keyFolding:"off",flattenDepth:Infinity}
    )
}
