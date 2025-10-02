import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import heroImage from "@/assets/hero-main.jpg";

const Showroom = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "1",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Showroom visit scheduled! We'll send you a confirmation email shortly.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "1",
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Our showroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Visit Our Showroom
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our furniture in person and meet with our design consultants.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              What to Expect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your showroom visit is a personalized experience designed to help you find the perfect piece.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Private Consultation",
                description: "One-on-one time with our design team to discuss your space, style, and needs.",
              },
              {
                title: "Touch & Feel",
                description: "Experience the quality of our materials firsthand—from wood grain to fabric texture.",
              },
              {
                title: "Customization Options",
                description: "Explore material swatches, finish samples, and discuss custom dimensions.",
              },
            ].map((item, idx) => (
              <div key={idx} className="card-premium p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-xl font-bold text-accent">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
                Schedule Your Visit
              </h2>
              <p className="text-lg text-muted-foreground">
                Book a private appointment at our Portland showroom.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card-premium p-8 md:p-12 space-y-8">
              {/* Personal Info */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Visit Details */}
              <div className="space-y-6 pt-8 border-t border-border">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Preferred Time *
                    </Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Select value={formData.guests} onValueChange={(value) => setFormData({ ...formData, guests: value })}>
                    <SelectTrigger id="guests">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="3">3 people</SelectItem>
                      <SelectItem value="4">4+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific pieces you'd like to see or questions you have?"
                    className="resize-none"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full btn-premium text-base py-6">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Location Info */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-foreground">
                <MapPin className="inline h-8 w-8 mr-2 text-accent" />
                Our Location
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">
                  1234 Craftsman Lane<br />
                  Portland, OR 97201
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p className="font-medium text-foreground">Showroom Hours:</p>
                  <p>Monday - Friday: 10:00 AM - 6:00 PM</p>
                  <p>Saturday: 11:00 AM - 5:00 PM</p>
                  <p>Sunday: By Appointment Only</p>
                </div>
                <Button asChild variant="outline" className="btn-outline-premium">
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden bg-secondary/20">
              <iframe
                title="Showroom Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2795.1791469447!2d-122.67648!3d45.52345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDMxJzI0LjQiTiAxMjLCsDQwJzM1LjMiVw!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Showroom;
