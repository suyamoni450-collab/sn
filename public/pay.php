<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>পেমেন্ট প্রসেসিং...</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
      padding: 20px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-top-color: #06b6d4;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      font-size: 18px;
      margin: 0 0 8px;
      color: #f8fafc;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
  </style>
  <script>
    (function() {
      try {
        var search = window.location.search || "";
        window.location.replace("/api/pay" + search);
      } catch(e) {
        window.location.href = "/api/pay" + (window.location.search || "");
      }
    })();
  </script>
</head>
<body>
  <div class="spinner"></div>
  <h2>নিরাপদ পেমেন্ট গেটওয়েতে সংযোগ করা হচ্ছে...</h2>
  <p>অনুগ্রহ করে অপেক্ষা করুন, পেজ রিফ্রেশ করবেন না।</p>
</body>
</html>
