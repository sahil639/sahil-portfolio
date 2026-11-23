// Serves the static site, adding HTTP range support for videos in /media/.
// iMessage (and Safari) need range requests to play og:video previews.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    const range = request.headers.get("Range");
    if (res.status !== 200) return res;

    const headers = new Headers(res.headers);
    headers.set("Accept-Ranges", "bytes");
    if (!range) return new Response(res.body, { status: 200, headers });

    const body = await res.arrayBuffer();
    const size = body.byteLength;
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    let start, end;
    if (m && (m[1] || m[2])) {
      if (m[1] === "") { start = Math.max(0, size - Number(m[2])); end = size - 1; }
      else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }
    }
    if (start === undefined || start > end || start >= size) {
      headers.set("Content-Range", `bytes */${size}`);
      headers.delete("Content-Length");
      return new Response(null, { status: 416, headers });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    const part = request.method === "HEAD" ? null : body.slice(start, end + 1);
    return new Response(part, { status: 206, headers });
  },
};
