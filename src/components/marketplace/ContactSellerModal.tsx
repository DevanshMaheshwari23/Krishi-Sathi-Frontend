import { useState } from "react";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerEmail: string;
  cropName: string;
}

export const ContactSellerModal = ({
  isOpen,
  onClose,
  sellerName,
  sellerEmail,
  cropName,
}: ContactSellerModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Hi, I'm interested in your ${cropName} listing. Please share availability details.`,
  });
  const [sending, setSending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Message sent to ${sellerName}`);
    setSending(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Contact Seller"
      description={`Reach out to ${sellerName} about ${cropName}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="surface-subtle p-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Mail className="h-4 w-4" />
            <span>{sellerEmail}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <MessageSquare className="h-4 w-4" />
            <span>Listing: {cropName}</span>
          </div>
        </div>

        <Input
          label="Your Name"
          required
          value={formData.name}
          onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="John Doe"
        />

        <Input
          label="Your Email"
          type="email"
          required
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="john@example.com"
        />

        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-10 h-4 w-4 text-soft" />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
            className="pl-10"
            placeholder="+91 98765 43210"
          />
        </div>

        <Textarea
          label="Message"
          required
          rows={4}
          value={formData.message}
          onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={sending}>
            <Send className="h-4 w-4" />
            Send Message
          </Button>
        </div>
      </form>
    </Modal>
  );
};
