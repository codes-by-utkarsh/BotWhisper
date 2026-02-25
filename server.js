require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_COOKIE_VAL = process.env.ADMIN_COOKIE;

app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const tickets = [];
let ticketIdCounter = 1;

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.GUEST_USERNAME && password === process.env.GUEST_PASSWORD) {
        res.json({ success: true, role: 'guest' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/tickets', (req, res) => {
    const { subject, description } = req.body;
    if (!subject || !description) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const newTicket = {
        id: ticketIdCounter++,
        subject,
        description,
        status: 'open'
    };
    tickets.push(newTicket);
    res.json({ success: true, ticket: newTicket });
});

app.get('/api/tickets/:id', (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, ticket });
});

app.get('/ticket-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ticket.html'));
});

app.post('/api/report', (req, res) => {
    const { ticketId } = req.body;
    const ticket = tickets.find(t => t.id == ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    console.log(`[+] Admin bot requested for Ticket ID: ${ticketId}`);

    exec(`node admin-bot.js ${ticketId}`, (error, stdout, stderr) => {
        if (error) console.error(`Error executing bot: ${error}`);
        if (stdout) console.log(`Bot output: ${stdout}`);
        if (stderr) console.error(`Bot stderr: ${stderr}`);
    });

    res.json({ success: true, message: 'Admin notified. They will review the ticket shortly.' });
});

app.get('/api/flag', (req, res) => {
    const sessionId = req.cookies.session_id;
    if (sessionId === ADMIN_COOKIE_VAL) {
        res.json({ success: true, flag: process.env.FLAG });
    } else {
        res.status(403).json({ success: false, message: 'Unauthorized. Admins only.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
