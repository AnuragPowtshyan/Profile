// Fix: Smooth scrolling with correct offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const navbar = document.querySelector('nav'); 
            const offsetHeight = navbar ? navbar.offsetHeight : 0; // Ensure navbar is detected
            const offsetTop = target.offsetTop - offsetHeight;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const responseMessage = document.getElementById('responseMessage');

    if (!name || !email || !message) {
        responseMessage.innerText = "All fields are required.";
        responseMessage.style.color = "red";
        return;
    }

    const response = await fetch('/send-message', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
        headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    responseMessage.innerText = result.message;
    responseMessage.style.color = response.ok ? "green" : "red";

    if (response.ok) {
        document.getElementById('contactForm').reset(); // Clear form after success
    }
});

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,   // Your email
        pass: process.env.PASSWORD // App password (not regular password)
    }
});

app.post('/send-message', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const mailOptions = {
        from: email,
        to: process.env.EMAIL,  // Your email to receive messages
        subject: `New Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: "Error sending message" });
        }
        res.status(200).json({ message: "Message sent successfully!" });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
