import React, { useState } from "react";
import { TextField, Button, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await emailjs.send(
        "service_vbc0rsi", // replace with EmailJS service ID
        "template_qra8f7i", // replace with EmailJS template ID
        formData,
        "7jfwN0-VfyIBeEoWK" // replace with your public key
      );
      setOpen(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Email send error:", error);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Message"
            name="message"
            multiline
            rows={4}
            fullWidth
            value={formData.message}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Send Message
          </Button>
        </form>
      </motion.div>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          Message sent successfully!
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default ContactUs;
