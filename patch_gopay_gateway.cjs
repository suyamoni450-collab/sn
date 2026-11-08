const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const filesToPatch = [
  "dist/assets/index-sn777-v12.js",
  "dist_backup/assets/index-sn777-v12.js",
  "public/assets/index-sn777-v12.js"
];

// 1. Target function Kr replacement (Strict GoPay for bKash/Nagad only)
const newKrFunction = `Kr=async()=>{
  window._sn777_dep_submitting=!1;
  const _effUid=(gt.currentUser&&gt.currentUser.uid)||(typeof ve!=="undefined"&&ve&&(ve.id||ve.uid))||(window.__sn777_user_profile&&(window.__sn777_user_profile.uid||window.__sn777_user_profile.id))||localStorage.getItem("sn777_user_id")||localStorage.getItem("sn777_username")||"";
  if(!_effUid){
    Fe("অনুগ্রহ করে প্রথমে লগইন করুন।");
    Je(!0);
    return;
  }
  const E=parseInt(Is||"0"),ee=200,W=25000;
  if(E<ee){
    Fe("সর্বনিম্ন ডিপোজিট "+ee+" টাকা।");
    Je(!0);
    return;
  }
  if(E>W){
    Fe("সর্বোচ্চ ডিপোজিট "+W.toLocaleString()+" টাকা।");
    Je(!0);
    return;
  }
  if(!Be || !["bkash","nagad"].includes(Be.toLowerCase())){
    Fe("অনুগ্রহ করে বিকাশ বা নগদ নির্বাচন করুন।");
    Je(!0);
    return;
  }
  xe(!0);
  window._sn777_dep_submitting=!0;
  const Te="ORD"+Date.now();
  const _nowIso=new Date().toISOString();
  const _newDepTx={
    id:Te,order_no:Te,uid:_effUid,
    type:"deposit",amount:E,method:Be,status:"pending",
    timestamp:_nowIso,createdAt:_nowIso,gateway:"gopay",
    description:"Deposit Integration (Pay-in) "+E+" টাকা ("+Be.toUpperCase()+")"
  };
  try{
    localStorage.setItem("sn777_pending_order",JSON.stringify({order_no:Te,amount:Number(E),time:Date.now()}));
    const _arr=JSON.parse(localStorage.getItem("sn777_tx_list_"+_effUid)||"[]");
    _arr.unshift(_newDepTx);
    localStorage.setItem("sn777_tx_list_"+_effUid,JSON.stringify(_arr));
    typeof gs=="function"&&gs(_arr);
  }catch(e){}
  const _gopayUrl="/pay.php?uid="+encodeURIComponent(_effUid)+"&amount="+encodeURIComponent(E)+"&method="+encodeURIComponent(Be.toLowerCase())+"&order_no="+encodeURIComponent(Te);
  try{
    window._sn777_dep_submitting=!1;
    xe(!1);
    fi("");
    window.location.assign(_gopayUrl);
  }catch(e){
    window.location.href=_gopayUrl;
  }
},[zs,lo]`;

for (const relPath of filesToPatch) {
  const filePath = path.join(__dirname, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // 1. Replace Kr function
    const krRegex = /Kr\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[zs\s*,\s*lo\]/;
    if (krRegex.test(content)) {
      content = content.replace(krRegex, newKrFunction);
      changed = true;
      console.log(`[GoPay Patch] Replaced Kr deposit handler in ${relPath}`);
    }

    // 2. Fix verify-payment unexpected end of JSON error
    const oldVerifyCall = 'const resp=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order_no:L})});const resData=await resp.json();';
    const safeVerifyCall = 'const resp=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order_no:L})});let resData={};try{const _rt=await resp.text();resData=_rt?JSON.parse(_rt):{}}catch(e){resData={}}';
    if (content.includes(oldVerifyCall)) {
      content = content.replace(oldVerifyCall, safeVerifyCall);
      changed = true;
      console.log(`[GoPay Patch] Protected verify-payment JSON parsing in ${relPath}`);
    }

    // 3. Ensure limit label is 200 BDT for bKash and Nagad
    const dynamicLimitText = 'children:"সীমা: ৳"+(Be==="bkash"||Be==="usdt"||Be==="usdterc20"?"৫০০":"২০০")+" - ৳২৫,০০০"';
    const standardLimitText = 'children:"সীমা: ৳২০০ - ৳২৫,০০০"';
    if (content.includes(dynamicLimitText)) {
      content = content.replace(dynamicLimitText, standardLimitText);
      changed = true;
      console.log(`[GoPay Patch] Set limit label to 200 BDT in ${relPath}`);
    }

    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`[GoPay Patch] Saved ${relPath}`);
    }

  }
}

console.log("[GoPay Patch] Complete.");
