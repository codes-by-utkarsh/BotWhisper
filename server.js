require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_COOKIE_VAL = process.env.ADMIN_COOKIE;

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
    if (username === 'guest' && password === 'guest') {
        res.json({ success: true, role: 'guest' });
    } else if (username === 'admin' && password === 'admin') {
        res.cookie('session_id', ADMIN_COOKIE_VAL, { httpOnly: false });
        res.json({ success: true, role: 'admin' });
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

app.get('/ticket-view/:id', (req, res) => {
    const ticket = tickets.find(t => t.id == req.params.id);
    if (!ticket) {
        return res.status(404).send('Ticket not found');
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en" ng-app="ecoStoreApp">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket #${ticket.id} - Eco-Secure Store</title>
        <link rel="stylesheet" href="/css/style.css">
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
        <script src="/js/app.js"></script>
    </head>
    <body ng-controller="MainCtrl" ng-init="createdTicket={id: ${ticket.id}}">
        <header>
            <div class="container">
                <h1>🌿 Eco-Secure Store</h1>
                <nav>
                    <a class="nav-link" href="/">Home</a>
                </nav>
            </div>
        </header>

        <div class="container">
            <div class="card">
                <div class="success-message">
                    <h3>✓ Ticket Created Successfully!</h3>
                    <p>Your Ticket ID is: <strong>#${ticket.id}</strong></p>
                </div>

                <div class="ticket-display">
                    <p><strong>Subject:</strong> ${ticket.subject}</p>
                    <p><strong>Status:</strong> <span class="status-badge">${ticket.status}</span></p>
                </div>

                <p class="info-text">Our support team reviews tickets manually. For urgent issues, you can request an immediate admin review.</p>
                
                <div class="button-group">
                    <button ng-click="reportTicket()" class="btn-primary">Request Admin Review</button>
                    <a href="/" class="btn-secondary">Return to Shop</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
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
