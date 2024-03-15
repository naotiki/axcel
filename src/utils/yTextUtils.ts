import * as Y from "yjs";
import diff from "fast-diff";


export function yTextUpdate(yText: Y.Text, newStr: string,oldStr:string) {
  yText.applyDelta(diffToDelta(diff(oldStr,newStr)));
}

/** Convert a fast-diff result to a YJS delta. */
function diffToDelta(diffResult:diff.Diff[]) {
  return diffResult.map(([op, value]) =>
    op === diff.INSERT
      ? { insert: value }
      : op === diff.EQUAL
      ? { retain: value.length }
      : op === diff.DELETE
      ? { delete: value.length }
      : null
  );
}