import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowRight, BarChart3, Clock, FileText, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Monitoring',
      description: 'Live box count tracking with instant updates as operations progress.',
    },
    {
      icon: Zap,
      title: 'Session Management',
      description: 'Control and oversee warehouse sessions with precision and ease.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Historical data review and performance analytics for informed decisions.',
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Automated report and challan generation for compliance and tracking.',
    },
  ];

  const workflow = [
    {
      number: '01',
      title: 'Start a Session',
      description: 'Upload video or begin live monitoring for box counting operations.',
    },
    {
      number: '02',
      title: 'Monitor in Real-Time',
      description: 'Watch live box counts and session metrics as they happen.',
    },
    {
      number: '03',
      title: 'Review & Analyze',
      description: 'Access historical data and detailed analytics for each session.',
    },
    {
      number: '04',
      title: 'Export & Report',
      description: 'Generate and download reports, records, and challans instantly.',
    },
  ];

  const trustPoints = [
    'Built for warehouse operators and managers',
    'Local-first processing and real-time monitoring',
    'Accurate session history and tracking',
    'Simple, intuitive workflow',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline-block">AgniSight</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Workflow
            </a>
            <a href="#trust" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
            <Button onClick={() => navigate('/login')} className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="mx-auto">
              💡 Smarter warehouse operations
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Intelligent box counting for modern warehouses
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Real-time monitoring, session management, and reporting built for fast-moving warehouse operations. Simplify counting. Accelerate decisions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              Launch Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>

          {/* Product Preview Placeholder */}
          <div className="mt-16 rounded-lg border border-border bg-card overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)]">
            <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
              <div className="text-center space-y-3">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground text-sm">Product dashboard preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Powerful features. Simple interface.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage warehouse operations efficiently and accurately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Workflow Section */}
      <section id="workflow" className="container mx-auto px-4 py-24">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Simple workflow. Real results.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get from setup to reporting in minutes, not days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((step, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-6xl font-bold text-primary/20 leading-none">{step.number}</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Trust Section */}
      <section id="trust" className="container mx-auto px-4 py-24">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Built for trust and accuracy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed with warehouse operations in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point, idx) => (
              <div key={idx} className="p-6 border border-border rounded-lg bg-card">
                <p className="text-base font-medium text-foreground leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Ready to simplify warehouse counting?
            </h2>
            <p className="text-lg text-muted-foreground">
              Start for free today. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
        <p>© 2026 AgniSight. Built for warehouse operations excellence.</p>
      </footer>
    </div>
  );
};
