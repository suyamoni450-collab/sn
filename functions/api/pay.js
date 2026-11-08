// Cloudflare Pages Function: GoPay Checkout (Pay-in) Handler
// Directly executes GoPay API handshake and redirects browser to Cashier

function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function utf8Encode(string) {
    return unescape(encodeURIComponent(string));
  }

  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = utf8Encode(string);
  x = convertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toLowerCase();
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Extract parameters from URL search or FormData
  let uid = url.searchParams.get("uid") || "";
  let amount = parseInt(url.searchParams.get("amount") || "300", 10);
  let method = (url.searchParams.get("method") || "bkash").toLowerCase();
  
  // Guarantee unique order number to prevent "Duplicate order number" on refresh/retry
  const uniqueOrderNo = "ORD" + Date.now() + Math.floor(Math.random() * 90 + 10);
  let order_no = uniqueOrderNo;

  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.json();
        if (body.uid) uid = body.uid;
        if (body.amount) amount = parseInt(body.amount, 10);
        if (body.method) method = String(body.method).toLowerCase();
      } else if (contentType.includes("form")) {
        const formData = await request.formData();
        if (formData.get("uid")) uid = formData.get("uid");
        if (formData.get("amount")) amount = parseInt(formData.get("amount"), 10);
        if (formData.get("method")) method = String(formData.get("method")).toLowerCase();
      }
    } catch (e) {}
  }

  if (isNaN(amount) || amount < 300) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deposit Limit</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#0b0f19; color:#fff; text-align:center; padding:50px 20px;">
        <div style="max-width:450px; margin:0 auto; background:#111827; border:1px solid #374151; border-radius:16px; padding:32px 24px;">
          <h2 style="color:#f59e0b; margin:0 0 12px; font-size:20px;">সর্বনিম্ন ডিপোজিট সীমা ৩০০ টাকা</h2>
          <p style="font-size:14px; color:#cbd5e1; margin-bottom:20px;">আমাদের গেটওয়েতে সর্বনিম্ন ডিপোজিট ৩০০ টাকা। অনুগ্রহ করে ৩০০ টাকা বা তার বেশি ডিপোজিট করুন।</p>
          <a href="/" style="display:inline-block; background:#0284c7; color:#fff; padding:12px 28px; border-radius:12px; text-decoration:none; font-weight:bold; font-size:15px;">ফিরে যান</a>
        </div>
      </body>
      </html>
    `, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }

  const GOPAY_APP_ID = "GP_47479521";
  const GOPAY_SECRET_KEY = "77a2d3a02360d495a1b07abfe5b196e8";
  const GOPAY_API_URL = "https://mch.go-pay.cyou/pay.php";

  const pay_type = method.includes("nagad") ? "2201" : "2202";
  const goods_name = method.includes("nagad") ? "NAGAD" : "BKASH";
  const order_date = formatDate(new Date());

  const origin = url.origin || "https://sn777.site";
  const notify_url = "https://sn777.site/gopay_notify.php";
  const page_url = `${origin}/return?order_no=${encodeURIComponent(order_no)}`;

  const params = {
    app_id: GOPAY_APP_ID,
    goods_name: goods_name,
    mch_order_no: order_no,
    mch_return_msg: uid || "user",
    notify_url: notify_url,
    order_date: order_date,
    page_url: page_url,
    pay_type: pay_type,
    trade_amount: String(amount)
  };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(k => `${k}=${params[k]}`).join("&") + `&key=${GOPAY_SECRET_KEY}`;
  const sign = md5(signStr);

  params.sign = sign;
  params.sign_type = "MD5";

  try {
    const gopayRes = await fetch(GOPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      body: new URLSearchParams(params).toString(),
      redirect: "manual"
    });

    if (gopayRes.status === 301 || gopayRes.status === 302) {
      const loc = gopayRes.headers.get("location");
      if (loc) {
        return Response.redirect(loc, 302);
      }
    }

    const resText = await gopayRes.text();
    let payUrl = "";
    let errMsg = "";

    try {
      const jsonRes = JSON.parse(resText);
      payUrl = jsonRes.payUrl || jsonRes.pay_url || jsonRes.payInfo || jsonRes.url || "";
      if (jsonRes.respCode === "FAIL" || jsonRes.tradeMsg) {
        errMsg = jsonRes.tradeMsg || "";
      }
    } catch (pe) {}

    if (payUrl) {
      return Response.redirect(payUrl, 302);
    }

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Error</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#0b0f19; color:#fff; text-align:center; padding:50px 20px;">
        <div style="max-width:450px; margin:0 auto; background:#111827; border:1px solid #374151; border-radius:16px; padding:32px 24px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <div style="font-size:42px; margin-bottom:12px;">⚠️</div>
          <h2 style="color:#ef4444; margin:0 0 12px; font-size:20px;">পেমেন্ট গেটওয়েতে সমস্যা হয়েছে</h2>
          <p style="font-size:15px; color:#cbd5e1; margin-bottom:8px;">${errMsg || "পেমেন্ট প্রসেস সম্পন্ন করা যায়নি"}</p>
          <p style="font-size:13px; color:#94a3b8; margin-bottom:24px;">দয়া করে নিশ্চিত করুন আপনার ডিপোজিট পরিমাণ সর্বনিম্ন ৩০০ টাকা এবং সর্বোচ্চ ৫০,০০০ টাকার মধ্যে।</p>
          <a href="/" style="display:inline-block; background:linear-gradient(to right, #0284c7, #0369a1); color:#fff; padding:12px 28px; border-radius:12px; text-decoration:none; font-weight:bold; font-size:15px;">ওয়েবসাইটে ফিরে যান</a>
        </div>
      </body>
      </html>
    `, {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (fetchErr) {
    return new Response("Payment Gateway Connection Error: " + fetchErr.message, {
      status: 502,
      headers: { "Content-Type": "text/plain" }
    });
  }
}
