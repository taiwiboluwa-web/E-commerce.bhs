import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Exponair Events Management Limited — Passionately bringing your events alive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#f7f3eb",color:"#171717",position:"relative"}}>
      <div style={{position:"absolute",inset:26,border:"1px solid #d9cdb8",display:"flex"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:175,width:270,position:"relative",marginBottom:8}}>
        <div style={{position:"absolute",left:92,top:5,width:58,height:125,background:"#f4c400",borderRadius:"90% 10% 90% 10%",transform:"rotate(-24deg)"}}/>
        <div style={{position:"absolute",left:145,top:30,width:105,height:58,background:"#f4c400",borderRadius:"90% 10% 90% 10%",transform:"rotate(-10deg)"}}/>
        <div style={{position:"absolute",left:48,top:85,width:115,height:54,background:"#0b9d57",borderRadius:"10% 90% 10% 90%",transform:"rotate(14deg)"}}/>
        <div style={{position:"absolute",left:138,top:105,width:95,height:13,background:"#d52d2d",borderRadius:20,transform:"rotate(25deg)"}}/>
        <div style={{position:"absolute",left:224,top:120,width:20,height:20,background:"#d52d2d",borderRadius:20}}/>
      </div>
      <div style={{fontFamily:"Georgia",fontStyle:"italic",fontSize:116,letterSpacing:-7,lineHeight:1,color:"#171717",display:"flex"}}>Exponair</div>
      <div style={{width:620,height:3,background:"#d52d2d",marginTop:26,marginBottom:20}}/>
      <div style={{fontFamily:"Arial",fontSize:24,letterSpacing:8,color:"#171717",display:"flex"}}>EVENTS MANAGEMENT LTD</div>
      <div style={{fontFamily:"Georgia",fontStyle:"italic",fontSize:23,color:"#555",marginTop:18,display:"flex"}}>Passionately bringing your events alive</div>
      <div style={{position:"absolute",bottom:46,fontFamily:"Arial",fontSize:12,letterSpacing:5,color:"#8a806f",display:"flex"}}>LAGOS · NIGERIA</div>
    </div>,
    { ...size }
  );
}
