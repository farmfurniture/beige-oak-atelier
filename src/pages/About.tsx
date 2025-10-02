import { Award, Users, Leaf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import craftsmanshipImage from "@/assets/craftsmanship.jpg";
import heroImage from "@/assets/hero-main.jpg";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Craftsmanship",
      description: "Every piece is handcrafted by master artisans with decades of experience in traditional joinery and upholstery.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "We source materials responsibly, prioritizing sustainably harvested hardwoods and eco-friendly fabrics.",
    },
    {
      icon: Award,
      title: "Quality",
      description: "Our lifetime warranty reflects our confidence in the durability and timeless design of every piece we create.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We're more than a workshop—we're a team dedicated to preserving traditional craftsmanship for future generations.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Our workshop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 animate-fade-in-up">
            Our Story
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Made by hand. Loved for years.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif font-bold text-foreground">
                Two Decades of Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Bēige & Oak was founded in 2004 by master craftsman Michael Chen and interior designer 
                  Elena Rodriguez. What began as a small workshop in Portland has grown into a renowned 
                  atelier known for creating furniture that transcends trends.
                </p>
                <p>
                  Our philosophy is simple: create pieces so well-made, so beautifully designed, that they 
                  become family heirlooms. Every joint is hand-fitted, every fabric hand-selected, every 
                  finish hand-applied with the care and precision that only comes from true craftsmanship.
                </p>
                <p>
                  Today, our team of fifteen artisans continues this tradition, working with sustainably 
                  sourced materials and time-honored techniques to create furniture that tells a story—your story.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={craftsmanshipImage}
                alt="Artisan at work"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">What We Stand For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our values guide every decision, from material selection to the final delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Our Craft Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to completion, every step is executed with precision and care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "Design & Consultation",
                description: "We begin with a conversation about your needs, style preferences, and how you'll use the piece. Our design team creates detailed sketches and material samples.",
              },
              {
                step: "Handcrafted Construction",
                description: "Master craftsmen bring the design to life using traditional joinery, premium materials, and meticulous attention to every detail.",
              },
              {
                step: "Finishing & Delivery",
                description: "Each piece receives multiple coats of hand-applied finish and a thorough quality inspection before white-glove delivery to your home.",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="pl-8 space-y-3">
                  <h3 className="text-xl font-serif font-semibold text-foreground">{item.step}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-4xl font-serif font-bold">Visit Our Workshop</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            See our craftsmen at work and explore our collection in person. Schedule a private showroom visit today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/showroom">Book a Visit</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
