import React, { useState, useEffect } from 'react';
import { Plus, User, Mail, Phone, MapPin, Edit, Trash2 } from 'lucide-react';
import './Contacts.css';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const Contacts: React.FC<{ os: any }> = ({ os }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const contactsPath = '/home/user/contacts/contacts.json';
      const exists = await os.syscall('fs.exists', { path: contactsPath });
      if (exists) {
        const data = await os.syscall('fs.read', { path: contactsPath });
        const text = new TextDecoder().decode(data);
        const parsed = JSON.parse(text);
        setContacts(parsed);
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
    }
  };

  const saveContacts = async () => {
    try {
      const contactsPath = '/home/user/contacts/contacts.json';
      await os.syscall('fs.mkdir', { path: '/home/user/contacts' });
      const json = JSON.stringify(contacts);
      await os.syscall('fs.write', { 
        path: contactsPath, 
        data: new TextEncoder().encode(json) 
      });
    } catch (e) {
      console.error('Failed to save contacts:', e);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(query) || 
           contact.email?.toLowerCase().includes(query) ||
           contact.phone?.includes(query);
  }).sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleAddContact = () => {
    setEditingContact(null);
    setShowForm(true);
    setSelectedContact(null);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
      await saveContacts();
    }
  };

  const handleSaveContact = async (contactData: Partial<Contact>) => {
    if (editingContact) {
      setContacts(contacts.map(c => 
        c.id === editingContact.id ? { ...c, ...contactData } : c
      ));
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email,
        phone: contactData.phone,
        address: contactData.address,
        notes: contactData.notes,
      };
      setContacts([...contacts, newContact]);
    }
    await saveContacts();
    setShowForm(false);
    setEditingContact(null);
  };

  const getInitials = (contact: Contact) => {
    const first = contact.firstName?.[0]?.toUpperCase() || '';
    const last = contact.lastName?.[0]?.toUpperCase() || '';
    return first + last || '?';
  };

  return (
    <div className="contacts-app">
      <div className="contacts-sidebar">
        <div className="contacts-header">
          <div className="contacts-title">Contacts</div>
          <button className="add-contact-btn" onClick={handleAddContact}>
            <Plus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Add
          </button>
        </div>
        
        <input
          type="text"
          className="search-box"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="contacts-list">
          {filteredContacts.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedContact(contact);
                  setShowForm(false);
                }}
              >
                <div className="contact-avatar">
                  {getInitials(contact)}
                </div>
                <div className="contact-info">
                  <div className="contact-name">
                    {contact.firstName} {contact.lastName}
                  </div>
                  {contact.email && (
                    <div className="contact-email">{contact.email}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="contacts-main">
        {showForm ? (
          <ContactForm
            contact={editingContact}
            onSave={handleSaveContact}
            onCancel={() => {
              setShowForm(false);
              setEditingContact(null);
            }}
          />
        ) : selectedContact ? (
          <ContactDetail
            contact={selectedContact}
            onEdit={() => handleEditContact(selectedContact)}
            onDelete={() => handleDeleteContact(selectedContact.id)}
          />
        ) : (
          <div className="empty-state">
            <User className="empty-state-icon" />
            <div className="empty-state-text">Select a contact to view details</div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ContactFormProps {
  contact?: Contact | null;
  onSave: (data: Partial<Contact>) => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSave, onCancel }) => {
  const [firstName, setFirstName] = useState(contact?.firstName || '');
  const [lastName, setLastName] = useState(contact?.lastName || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [address, setAddress] = useState(contact?.address || '');
  const [notes, setNotes] = useState(contact?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() || lastName.trim()) {
      onSave({ firstName, lastName, email, phone, address, notes });
    }
  };

  return (
    <div className="contact-form">
      <h2 style={{ marginBottom: 30 }}>{contact ? 'Edit Contact' : 'New Contact'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            className="form-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            className="form-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-textarea"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="action-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="action-btn primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

interface ContactDetailProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, onEdit, onDelete }) => {
  const getInitials = () => {
    const first = contact.firstName?.[0]?.toUpperCase() || '';
    const last = contact.lastName?.[0]?.toUpperCase() || '';
    return first + last || '?';
  };

  return (
    <div className="contact-detail">
      <div className="contact-detail-header">
        <div className="contact-detail-avatar">{getInitials()}</div>
        <div>
          <div className="contact-detail-name">
            {contact.firstName} {contact.lastName}
          </div>
        </div>
        <div className="contact-detail-actions">
          <button className="action-btn" onClick={onEdit}>
            <Edit size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Edit
          </button>
          <button className="action-btn danger" onClick={onDelete}>
            <Trash2 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Delete
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">
          <Mail size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Email
        </div>
        <div className={`detail-value ${!contact.email ? 'empty' : ''}`}>
          {contact.email || 'No email'}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">
          <Phone size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Phone
        </div>
        <div className={`detail-value ${!contact.phone ? 'empty' : ''}`}>
          {contact.phone || 'No phone'}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">
          <MapPin size={14} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Address
        </div>
        <div className={`detail-value ${!contact.address ? 'empty' : ''}`}>
          {contact.address || 'No address'}
        </div>
      </div>

      {contact.notes && (
        <div className="detail-section">
          <div className="detail-label">Notes</div>
          <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>
            {contact.notes}
          </div>
        </div>
      )}
    </div>
  );
};

