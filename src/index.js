const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// مسارات الـ LED الداخلية للبوردة (Activity LED)
const ledTriggerPath = '/sys/class/leds/led0/trigger';
const ledBrightnessPath = '/sys/class/leds/led0/brightness';

// ضبط الـ LED للتحكم اليدوي المباشر
try {
    fs.writeFileSync(ledTriggerPath, 'none');
} catch (e) {
    console.log("تنبيه: تأكد من تشغيل السيرفر بصلاحيات sudo");
}

// دالة لتغيير حالة الـ LED
function setLed(state) {
    try {
        fs.writeFileSync(ledBrightnessPath, state.toString());
        console.log(`[LED] الحالة أصبحت الآن: ${state === 1 ? 'مضاءة 🟢' : 'مطفأة 🔴'}`);
    } catch (e) {
        console.error("خطأ في الكتابة على الـ LED:", e.message);
    }
}

// صفحة الويب تحتوي فقط على أزرار ON و OFF
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تحكم LED عبر الويب</title>
            <style>
                body { font-family: Tahoma, sans-serif; text-align: center; margin-top: 100px; background-color: #f0f2f5; }
                .card { background: white; padding: 40px; display: inline-block; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 30px; }
                .btn { padding: 20px 50px; font-size: 24px; margin: 15px; cursor: pointer; border: none; border-radius: 10px; color: white; font-weight: bold; transition: 0.2s; }
                .btn-on { background-color: #28a745; }
                .btn-on:hover { background-color: #218838; }
                .btn-off { background-color: #dc3545; }
                .btn-off:hover { background-color: #c82333; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>لوحة تحكم LED (Raspberry Pi)</h1>
                <button class="btn btn-on" onclick="location.href='/on'">تشغيل (ON)</button>
                <button class="btn btn-off" onclick="location.href='/off'">إطفاء (OFF)</button>
            </div>
        </body>
        </html>
    `);
});

// مسار التشغيل
app.get('/on', (req, res) => {
    setLed(1);
    res.redirect('/');
});

// مسار الإطفاء
app.get('/off', (req, res) => {
    setLed(0);
    res.redirect('/');
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log("==================================================");
    console.log(" السيرفر يعمل بنجاح! 🚀");
    console.log(" افتح المتصفح على الرابط: http://10.199.139.164:3000");
    console.log("==================================================");
});

// إيقاف آمن عند الخروج
process.on('SIGINT', () => {
    try {
        fs.writeFileSync(ledTriggerPath, 'mmc0'); // إعادة الـ LED لوضعها الطبيعي
    } catch (e) {}
    console.log("\nتم إيقاف السيرفر وإعادة ضبط الـ LED.");
    process.exit();
});