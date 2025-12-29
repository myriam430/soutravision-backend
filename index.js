const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route POST pour envoyer l'email
app.post("/send", async (req, res) => {
  const { name, email, company, phone, service, message } = req.body;

<<<<<<< HEAD
 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

=======
  const transporter = nodemailer.createTransport({
    host: "ssl0.ovh.net",
    port: 465,
    secure: true,
  
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
>>>>>>> f6e03f1 (Initial commit2  backend)

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "Nouveau message de contact",
      html: `
        <h3>Message de ${name}</h3>
        <p>Email : ${email}</p>
        <p>Entreprise : ${company}</p>
        <p>Téléphone : ${phone}</p>
        <p>Service : ${service}</p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true, message: "Message envoyé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur email" });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
});
