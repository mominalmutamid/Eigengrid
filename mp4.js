/* EigenGrid MP4 writer: wraps H.264 chunks from the browser's VideoEncoder into a playable .mp4 file (no libraries needed) */
const mp4U32=n=>new Uint8Array([n>>>24&255,n>>>16&255,n>>>8&255,n&255]),mp4U16=n=>new Uint8Array([n>>>8&255,n&255]);
const mp4Cat=a=>{let n=0;a.forEach(x=>{n+=x.length});const o=new Uint8Array(n);let p=0;a.forEach(x=>{o.set(x,p);p+=x.length});return o};
const mp4Str=s=>new Uint8Array(Array.from(s).map(c=>c.charCodeAt(0)));
const mp4Box=(t,...p)=>{const b=mp4Cat(p);return mp4Cat([mp4U32(b.length+8),mp4Str(t),b])};
class Mp4Writer{
constructor(w,h,fps,avcC){this.w=w;this.h=h;this.fps=fps;this.avcC=avcC;this.s=[];this.sync=[];this.size=0}
addChunk(d,key){this.s.push(d);if(key)this.sync.push(this.s.length);this.size+=d.length}
finish(){const N=this.s.length,w=this.w,h=this.h,ts=this.fps*1000,dur=Math.round(N/this.fps*1000),Z=n=>new Uint8Array(n);
const mat=mp4Cat([0x00010000,0,0,0,0x00010000,0,0,0,0x40000000].map(mp4U32));
const ftyp=mp4Box('ftyp',mp4Str('isom'),mp4U32(512),mp4Str('isom'),mp4Str('iso2'),mp4Str('avc1'),mp4Str('mp41'));
const avc1=mp4Box('avc1',Z(6),mp4U16(1),Z(16),mp4U16(w),mp4U16(h),mp4U32(0x00480000),mp4U32(0x00480000),mp4U32(0),mp4U16(1),Z(32),mp4U16(0x18),mp4U16(0xFFFF),mp4Box('avcC',this.avcC));
const build=off=>{
const stbl=mp4Box('stbl',mp4Box('stsd',mp4U32(0),mp4U32(1),avc1),mp4Box('stts',mp4U32(0),mp4U32(1),mp4U32(N),mp4U32(1000)),
mp4Box('stss',mp4U32(0),mp4U32(this.sync.length),...this.sync.map(mp4U32)),mp4Box('stsc',mp4U32(0),mp4U32(1),mp4U32(1),mp4U32(N),mp4U32(1)),
mp4Box('stsz',mp4U32(0),mp4U32(0),mp4U32(N),...this.s.map(x=>mp4U32(x.length))),mp4Box('stco',mp4U32(0),mp4U32(1),mp4U32(off)));
const minf=mp4Box('minf',mp4Box('vmhd',mp4U32(1),Z(8)),mp4Box('dinf',mp4Box('dref',mp4U32(0),mp4U32(1),mp4Box('url ',mp4U32(1)))),stbl);
const mdia=mp4Box('mdia',mp4Box('mdhd',mp4U32(0),mp4U32(0),mp4U32(0),mp4U32(ts),mp4U32(N*1000),mp4U16(0x55C4),mp4U16(0)),
mp4Box('hdlr',mp4U32(0),mp4U32(0),mp4Str('vide'),Z(12),mp4Str('VideoHandler\0')),minf);
const trak=mp4Box('trak',mp4Box('tkhd',mp4U32(3),mp4U32(0),mp4U32(0),mp4U32(1),mp4U32(0),mp4U32(dur),Z(8),mp4U16(0),mp4U16(0),mp4U16(0),mp4U16(0),mat,mp4U32(w<<16),mp4U32(h<<16)),mdia);
return mp4Box('moov',mp4Box('mvhd',mp4U32(0),mp4U32(0),mp4U32(0),mp4U32(1000),mp4U32(dur),mp4U32(0x00010000),mp4U16(0x0100),mp4U16(0),Z(8),mat,Z(24),mp4U32(2)),trak)};
const len=build(0).length,moov=build(ftyp.length+len+8);
return new Blob([ftyp,moov,mp4Cat([mp4U32(this.size+8),mp4Str('mdat')]),...this.s],{type:'video/mp4'})}}
