import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-hero)" }}
            >
              Master Finance the Smart Way
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build your financial literacy through expert-curated video modules covering SIPs, stock trading, and personal finance management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/learn">
              <Button size="lg" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Start Learning
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask Chatbot
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 w-full">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg mb-2">Systematic Investment Plans</h3>
              <p className="text-sm text-muted-foreground">
                Learn how to build wealth through disciplined, regular investments
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg mb-2">Stock Trading</h3>
              <p className="text-sm text-muted-foreground">
                Master the fundamentals of market analysis and trading strategies
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg mb-2">Personal Finance</h3>
              <p className="text-sm text-muted-foreground">
                Take control of your budget, savings, and financial future
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
