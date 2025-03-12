const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'Kullanıcı oluşturuldu', user });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası',error:error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası',error:error.message });
    }
};

const refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Geçersiz refresh token' });

        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    });
};

module.exports = { register, login, refreshToken };
