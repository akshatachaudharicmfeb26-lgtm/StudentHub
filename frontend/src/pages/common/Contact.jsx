import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      setError('Name cannot be empty.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!trimmedMessage) {
      setError('Message cannot be empty.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setError('Message must be at least 10 characters long.');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("https://formsubmit.co/ajax/studenthub0026@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          _subject: `New StudentHub Contact Message from ${trimmedName}`
        })
      });

      const result = await response.json();

      if (response.ok && result.success === "true") {
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(result.message || "Failed to send message. Please try again later.");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h1>
      <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        Have questions or need technical support? Get in touch with our administration team.
      </p>

      <div className="static-page-grid">
        {/* Info Column */}
        <div className="contact-card-container">
          <h2>Get in Touch</h2>
          <p>
            Our tech support and registrar office are open Monday to Friday, 9:00 AM - 5:00 PM. Drop us a line or visit us.
          </p>

          <div className="glass" style={{ borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MapPin size={24} color="var(--primary)" />
            <div>
              <h4 style={{ margin: 0 }}>University Campus</h4>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>128 Tech Boulevard, Academic Block B, Suite 400</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Phone size={24} color="var(--accent)" />
            <div>
              <h4 style={{ margin: 0 }}>Phone Contacts</h4>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>+1 (555) 382-9011 (Registrar) | +1 (555) 902-8822 (Support)</p>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Mail size={24} color="var(--secondary)" />
            <div>
              <h4 style={{ margin: 0 }}>Email Support</h4>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>studenthub0026@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="glass" style={{ borderRadius: '16px', padding: '2.5rem' }}>
          <h3>Send a Message</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill out the form below and we will get back to you within 24 hours.</p>

          {submitted && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Your message was sent successfully! Please check your inbox (or spam) to confirm your email activation if this is the first submission.
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                disabled={isSending}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe" 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                disabled={isSending}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea 
                className="form-control" 
                rows="4" 
                required 
                disabled={isSending}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your inquiry..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSending}>
              {isSending ? 'Sending Message...' : 'Send Message'} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
