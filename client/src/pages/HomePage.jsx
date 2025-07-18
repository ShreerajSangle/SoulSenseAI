import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, BookOpen, Target, BarChart3, Wind } from 'lucide-react'
import { personasAPI } from '../lib/api'

function HomePage({ user }) {
  const { data: personas = [], isLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: personasAPI.getAll
  })

  const features = [
    {
      icon: MessageCircle,
      title: "Chat with Personas",
      description: "Connect with AI companions designed for your emotional wellness",
      link: "/chat/sarah",
      color: "bg-lavender-500"
    },
    {
      icon: BookOpen,
      title: "Personal Journal",
      description: "Reflect and track your thoughts in a private space",
      link: "/diary",
      color: "bg-rose-500"
    },
    {
      icon: Target,
      title: "Goals & Growth",
      description: "Set meaningful goals and track your progress",
      link: "/goals",
      color: "bg-green-500"
    },
    {
      icon: BarChart3,
      title: "Wellness Analytics",
      description: "Insights into your emotional patterns and growth",
      link: "/analytics",
      color: "bg-blue-500"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lavender-200 border-t-lavender-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lavender-700">Loading personas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-50 via-rose-50 to-lavender-100"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="font-rosarivo text-5xl md:text-7xl font-light text-lavender-900 mb-6 leading-tight">
            Soul Sense
          </h1>
          <p className="font-nunito text-xl md:text-2xl text-lavender-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Meet your digital emotional companion. A safe, AI-powered space to reflect, feel, and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat/sarah"
              className="bg-lavender-600 hover:bg-lavender-700 text-white px-8 py-4 rounded-full font-nunito font-medium text-lg transition-all duration-300 hover:scale-105 gentle-shadow"
            >
              Start Chatting
            </Link>
            <button 
              onClick={() => document.getElementById('personas').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-lavender-600 text-lavender-600 hover:bg-lavender-600 hover:text-white px-8 py-4 rounded-full font-nunito font-medium text-lg transition-all duration-300"
            >
              Meet the Personas
            </button>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section id="personas" className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-rosarivo text-4xl md:text-5xl text-lavender-900 mb-4">
              Your Digital Companions
            </h2>
            <p className="font-nunito text-xl text-lavender-700 max-w-3xl mx-auto">
              Four unique AI personas, each designed to support different aspects of your emotional wellness journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona) => (
              <Link
                key={persona.id}
                to={`/chat/${persona.id}`}
                className="group bg-white rounded-2xl p-6 gentle-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-lavender-100"
              >
                <div 
                  className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: persona.color }}
                >
                  {persona.name.charAt(0)}
                </div>
                <h3 className="font-rosarivo text-xl text-lavender-900 mb-2">
                  {persona.name}
                </h3>
                <p className="font-nunito text-sm text-lavender-600 mb-2 font-medium">
                  {persona.role}
                </p>
                <p className="font-nunito text-sm text-lavender-600 leading-relaxed">
                  {persona.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-rosarivo text-4xl md:text-5xl text-lavender-900 mb-4">
              Wellness Tools
            </h2>
            <p className="font-nunito text-xl text-lavender-700 max-w-3xl mx-auto">
              Comprehensive features designed to support your mental health and personal growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group bg-white rounded-2xl p-6 gentle-shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-lavender-100"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-nunito text-lg font-semibold text-lavender-900 mb-2">
                  {feature.title}
                </h3>
                <p className="font-nunito text-sm text-lavender-600 leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Breathing Exercise CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-lavender-500 to-rose-500">
        <div className="max-w-4xl mx-auto text-center">
          <Wind className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="font-rosarivo text-3xl md:text-4xl text-white mb-4">
            Take a Mindful Moment
          </h2>
          <p className="font-nunito text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Start your wellness journey with a simple breathing exercise to center yourself.
          </p>
          <button className="bg-white text-lavender-600 hover:bg-lavender-50 px-8 py-4 rounded-full font-nunito font-medium text-lg transition-all duration-300 hover:scale-105">
            Try Breathing Exercise
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-lavender-900 to-rose-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-rosarivo text-2xl mb-4">SoulSense AI</h3>
              <p className="font-nunito text-white/80 leading-relaxed">
                A safe, AI-powered space to reflect, feel, and grow through meaningful conversations.
              </p>
            </div>
            <div>
              <h4 className="font-nunito font-semibold mb-4">Navigate</h4>
              <ul className="space-y-2 font-nunito text-white/80">
                <li><Link to="/chat/sarah" className="hover:text-white transition-colors">Chat</Link></li>
                <li><Link to="/diary" className="hover:text-white transition-colors">Journal</Link></li>
                <li><Link to="/goals" className="hover:text-white transition-colors">Goals</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-nunito font-semibold mb-4">Support</h4>
              <ul className="space-y-2 font-nunito text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-nunito font-semibold mb-4">Connect</h4>
              <p className="font-nunito text-white/80 mb-2">Developer: Shreeraj Sangle</p>
              <p className="font-nunito text-white/80">Built with care for mental wellness</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="font-nunito text-white/60">
              © 2025 SoulSense AI. A compassionate space for emotional wellness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage