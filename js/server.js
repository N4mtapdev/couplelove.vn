const express = require('express');
const request = require('request');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000; // Vercel sẽ cung cấp PORT, mặc định là 3000 nếu không có

// Middleware để parse JSON từ body
app.use(express.json());

// Dữ liệu người dùng (tạm thời lưu trong mảng, sẽ ghi vào file)
let users = [];
if (fs.existsSync('user.txt')) {
    const data = fs.readFileSync('user.txt', 'utf-8');
    users = data.trim().split('\n').map(line => {
        const [username, password, userType] = line.split(',');
        return { username, password, userType };
    }).filter(user => user.username); // Loại bỏ dòng trống
}

// Mã Pro cố định (có thể thay đổi)
const PRO_CODE = 'PRO2025';

// Endpoint đăng ký
app.post('/api/signup', (req, res) => {
    const { username, password, accountType, proCode, captchaToken } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password || !accountType) {
        return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // Xác minh reCAPTCHA
    if (!captchaToken) {
        return res.json({ success: false, message: 'Vui lòng hoàn tất xác minh reCAPTCHA!' });
    }

    const secretKey = 'YOUR_SECRET_KEY'; // Thay bằng Secret Key từ Google reCAPTCHA
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    request(verifyUrl, (error, response, body) => {
        if (error) {
            return res.json({ success: false, message: 'Lỗi xác minh reCAPTCHA!' });
        }

        const captchaResponse = JSON.parse(body);
        if (!captchaResponse.success) {
            return res.json({ success: false, message: 'Xác minh reCAPTCHA thất bại!' });
        }

        // Kiểm tra tên người dùng đã tồn tại
        if (users.some(user => user.username === username)) {
            return res.json({ success: false, message: 'Tên người dùng đã tồn tại!' });
        }

        let userType = accountType;
        if (accountType === 'Pro') {
            if (!proCode || proCode !== PRO_CODE) {
                return res.json({ success: false, message: 'Mã Pro không đúng!' });
            }
            userType = 'Pro';
        }

        // Thêm người dùng
        users.push({ username, password, userType });
        fs.appendFileSync('user.txt', `${username},${password},${userType}\n`);

        res.json({ success: true, message: 'Đăng ký thành công! Loại tài khoản: ' + userType });
    });
});

// Endpoint đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: 'Đăng nhập thành công!', userType: user.userType });
    } else {
        res.json({ success: false, message: 'Tên người dùng hoặc mật khẩu không đúng!' });
    }
});

// Serve file index.html (cho Vercel)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../index.html');
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});